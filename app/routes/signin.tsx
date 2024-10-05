import type { ActionFunction, MetaFunction } from "@remix-run/cloudflare";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import type { Env } from "~/env.server";
import { type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server/script/deps";
import { startAuthentication } from "@simplewebauthn/browser";

export const action: ActionFunction = async ({ request, context }) => {
  return getAuthenticator(context.env as Env).authenticate("google", request);
};

export const meta: MetaFunction = () => {
  return [
    { title: "로그인 | 몰루로그" },
    { description: "로그인하고 학생 정보, 미래시 계획을 관리해보세요." },
  ];
};

export default function SignIn() {
  const navigation = useNavigation();
  const [error, setError] = useState<string | null>(null);

  const passkeySubmit = useSubmit();

  const signInWithPasskey = async () => {
    if (!navigator.credentials) {
      setError("Passkey 조회에 실패했어요. 다른 방법으로 로그인해주세요.");
      return;
    }

    const authenticationOptions = await (await fetch("/auth/passkey/signin")).json<PublicKeyCredentialRequestOptionsJSON>();
    let authenticationResponse;
    try {
      authenticationResponse = await startAuthentication(authenticationOptions);
    } catch (e) {
      setError("Passkey 조회에 실패했어요. 다른 방법으로 로그인해주세요.");
      return;
    }

    passkeySubmit(JSON.stringify(authenticationResponse), {
      action: "/auth/passkey/signin",
      method: "post",
      encType: "application/json",
    });
  };

  return (
    <>
      <div className="absolute sm:relative sm:flex sm:py-24 bottom-0 w-full -mx-4 sm:mx-auto p-4 justify-center">
        <div className="w-full max-w-sm flex flex-col-reverse sm:flex-col">
          <p className="hidden sm:block text-4xl font-black">로그인</p>
          <p className="mt-4 mb-8 text-sm text-neutral-500 text-center sm:text-left">
            학생 정보, 미래시 계획을 관리해보세요.
          </p>
          <Form method="post">
            <Button className="w-full py-4 my-2" type="submit" color="primary" disabled={navigation.formAction !== undefined}>
              <p>Google 계정으로 로그인</p>
            </Button>
            <Button className="w-full py-4 my-2" type="button" color="black" onClick={signInWithPasskey} disabled={navigation.formAction !== undefined}>
              <p>Passkey로 로그인</p>
            </Button>
          </Form>
          {error && <p className="text-red-600 my-4 sm:my-8 text-sm">{error}</p>}
        </div>
      </div>
    </>
  );
}
