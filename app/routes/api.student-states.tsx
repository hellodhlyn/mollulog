import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/cloudflare";
import { Env } from "~/env";

function userStateKey(username: string) {
  return `student-states:${username}`;
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;

  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  if (!username) {
    return json({ error: "NOT_FOUND" }, { status: 400 });
  }

  const userState = await env.KV_USERDATA.get(userStateKey(username));
  if (!userState) {
    return json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return json({ states: JSON.parse(userState) });
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const states = formData.get("states") as string;

  await env.KV_USERDATA.put(userStateKey(username), states);

  return redirect(`/@${username}`);
};