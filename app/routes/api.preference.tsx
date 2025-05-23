import { type ActionFunctionArgs, redirect } from "react-router";
import type { SubmitFunction } from "react-router";
import { serializePreference, type Preference } from "~/auth/preference.server";

export async function submitPreference(fn: SubmitFunction, preference: Preference) {
  fn(preference, { method: "post", action: "/api/preference", encType: "application/json" });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const newPreference = await request.json<Preference>();
  return redirect(request.headers.get("Referer") ?? "/", {
    headers: {
      "Set-Cookie": await serializePreference(env, newPreference),
    },
  });
}
