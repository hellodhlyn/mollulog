import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { AuthorizationError } from "remix-auth";
import { getAuthenticator } from "~/auth/authenticator.server";
import { createPasskeyAuthenticationOptions } from "~/models/passkey";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  return json(await createPasskeyAuthenticationOptions(env));
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  try {
    return await getAuthenticator(env).authenticate("passkey", request, {
      successRedirect: "/register",
      failureRedirect: "/",
    });
  } catch (error) {
    console.log("error", error);
    if (error instanceof AuthorizationError) {
      return json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
};
