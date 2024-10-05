import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ProfileEditor } from "~/components/organisms/profile";
import type { Env } from "~/env.server";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { updateSensei } from "~/models/sensei";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { ProfileStudentsQuery } from "~/graphql/graphql";
import { SubTitle, Title } from "~/components/atoms/typography";
import { Label } from "~/components/atoms/form";
import { SubButton } from "~/components/atoms/button";
import { Key, KeyPlus } from "iconoir-react";
import { startRegistration } from "@simplewebauthn/browser";
import { getPasskeysBySensei, Passkey } from "~/models/passkey";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const profileStudentsQuery = graphql(`
  query ProfileStudents {
    students { studentId name }
  }
`)

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const { data } = await runQuery<ProfileStudentsQuery>(profileStudentsQuery, {});
  if (!data?.students) {
    throw new Error("failed to load students");
  }

  return json({
    sensei,
    passkeys: await getPasskeysBySensei(env, sensei),
    students: data.students,
  });
}

type ActionData = {
  error?: {
    username?: string;
    friendCode?: string;
  };
}

export const action: ActionFunction = async ({ request, context }) => {
  const env = context.env as Env;
  const authenticator = getAuthenticator(env);
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  sensei.username = formData.get("username") as string;
  sensei.profileStudentId = formData.has("profileStudentId") ? formData.get("profileStudentId") as string : null;
  sensei.friendCode = formData.get("friendCode") ? (formData.get("friendCode") as string).toUpperCase() : null;

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(sensei.username)) {
    return json<ActionData>({ error: { username: "4~20글자의 영숫자 및 _ 기호만 사용 가능합니다." } })
  }
  if (sensei.friendCode && !/^[A-Z]{8}$/.test(sensei.friendCode)) {
    return json<ActionData>({ error: { friendCode: "친구 코드는 알파벳 8글자에요." } });
  }

  const result = await updateSensei(env, sensei.id, sensei);
  if (result.error) {
    return json<ActionData>({ error: result.error });
  }

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(`/@${sensei.username}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function EditProfile() {
  const loaderData = useLoaderData<typeof loader>();
  const { sensei, students } = loaderData;

  const [passkeys, setPasskeys] = useState(loaderData.passkeys);

  const addPasskey = async () => {
    const creationOptions = await fetch("/auth/passkey/register");
    const creationResponse = await startRegistration(await creationOptions.json());

    const creationResult = await fetch("/auth/passkey/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creationResponse),
    });

    if (!creationResult.ok) {
      // TODO
      return;
    }

    const createdPasskey = await creationResult.json<Passkey>();
    setPasskeys((prev) => [...prev, createdPasskey]);
  };

  return (
    <div className="pb-16">
      <Title text="프로필" />

      <SubTitle text="계정 정보" />
      <Form method="post">
        <ProfileEditor
          students={students}
          initialData={sensei}
          error={useActionData<ActionData>()?.error}
        />
      </Form>

      <SubTitle text="인증/보안" />
      <Label text="Passkey 관리" />
      <div className="flex">
        <SubButton onClick={addPasskey}>
          <KeyPlus className="size-4" strokeWidth={2} />
          <span>Passkey 추가</span>
        </SubButton>
      </div>
      {passkeys.map((passkey) => (
        <div
          key={`passkey-${passkey.uid}`}
          className="my-4 py-2 px-4 flex bg-neutral-100 rounded-lg items-center"
        >
          <Key className="mr-3 size-6" strokeWidth={2} />
          <div>
            <p>{passkey.memo}</p>
            <p className="text-sm text-neutral-500">
              {dayjs.tz(passkey.createdAt, "utc").tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
