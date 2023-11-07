import type { LoaderFunction } from "@remix-run/cloudflare";
import type { Authenticator } from "remix-auth";

export const loader: LoaderFunction = ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator;
  return authenticator.authenticate("google", request, {
    successRedirect: "/register",
    failureRedirect: "/signin?state=failed",
  });
};
