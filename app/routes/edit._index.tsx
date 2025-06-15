import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, Link, redirect } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { ProfileEditor } from "~/components/organisms/profile";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { getSenseiById, updateSensei } from "~/models/sensei";
import { Callout, SubTitle, Title } from "~/components/atoms/typography";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAllStudents } from "~/models/student";
import { FormGroup } from "~/components/organisms/form";
import { LinkForm } from "~/components/molecules/form";
import { getPasskeysBySensei } from "~/models/passkey";

dayjs.extend(utc);
dayjs.extend(timezone);

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const senseiData = (await getSenseiById(env, sensei.id))!;
  return {
    sensei: {
      username: senseiData.username,
      bio: senseiData.bio,
      profileStudentId: senseiData.profileStudentId,
      friendCode: senseiData.friendCode,
    },
    allStudents: (await getAllStudents(env)).map((student) => ({
      uid: student.uid,
      name: student.name,
      order: student.order,
    })),
    passkeyCount: (await getPasskeysBySensei(env, sensei)).length,
  };
}

type ActionData = {
  error?: {
    username?: string;
    friendCode?: string;
    bio?: string;
  };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const authenticator = getAuthenticator(env);
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const formData = await request.formData();
  const getStringOrNull = (key: string) => formData.get(key) as string | null;
  sensei.username = formData.get("username") as string;
  sensei.bio = getStringOrNull("bio");
  sensei.profileStudentId = getStringOrNull("profileStudentId");
  sensei.friendCode = getStringOrNull("friendCode")?.toUpperCase() ?? null;

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(sensei.username)) {
    return { error: { username: "4~20글자의 영숫자 및 _ 기호만 사용할 수 있어요." } };
  }
  if (sensei.bio && sensei.bio.length > 100) {
    return { error: { bio: "100자 이하로 작성해주세요." } };
  }
  if (sensei.friendCode && !/^[A-Z]{8}$/.test(sensei.friendCode)) {
    return { error: { friendCode: "친구 코드는 알파벳 8글자에요." } };
  }

  const result = await updateSensei(env, sensei.id, sensei);
  if (result.error) {
    return { error: { username: "오류가 발생했어요. 잠시 후 다시 시도해주세요." } };
  }

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return data(null, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function EditProfile() {
  const { sensei, allStudents, passkeyCount } = useLoaderData<typeof loader>();
  return (
    <>
      <Title text="프로필 관리" />

      <Callout emoji="🚚" className="mb-8">
        <p>
          이제 학생 명부, 모집 이력, 편성/공략 정보는 내 정보 페이지에서 수정할 수 있어요.<br />
          <Link to="/my?path=students" className="text-blue-500 underline">
            내 정보 페이지로 →
          </Link>
        </p>
      </Callout>

      <SubTitle text="계정 정보" />
      <ProfileEditor
        method="put"
        students={allStudents}
        initialData={sensei}
        error={useActionData<typeof action>()?.error}
        submitOnChange
      />

      <SubTitle text="인증 및 보안" />
      <FormGroup>
        <LinkForm label="Passkey 관리" to="/edit/passkey" value={`${passkeyCount}개 등록됨`} />
        <LinkForm label="로그아웃" to="/signout" color="red" />
      </FormGroup>
    </>
  );
}
