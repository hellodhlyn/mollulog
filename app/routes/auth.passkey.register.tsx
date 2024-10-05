import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { RegistrationResponseJSON } from "@simplewebauthn/server/script/deps";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Env } from "~/env.server";
import { createPasskeyCreationOptions, verifyAndCreatePasskey } from "~/models/passkey";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  return json(await createPasskeyCreationOptions(env, currentUser));
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  const creationResponse = await request.json<RegistrationResponseJSON>();
  const passkey = await verifyAndCreatePasskey(env, currentUser, creationResponse);
  if (!passkey) {
    return json({ error: "failed to verify registration response" }, { status: 400 });
  }
  return json(passkey);
};
