import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Env } from "~/env.server";
import { createPasskeyAuthenticationOptions } from "~/models/passkey";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  return json(await createPasskeyAuthenticationOptions(env));
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.env as Env;
  return getAuthenticator(env).authenticate("passkey", request, {
    successRedirect: "/register",
    failureRedirect: "/signin?state=failed",
  });
};
