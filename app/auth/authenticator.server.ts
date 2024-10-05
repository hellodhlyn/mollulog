import type { SessionStorage} from "@remix-run/cloudflare";
import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import type { Env } from "~/env.server";
import type { Sensei } from "~/models/sensei";
import { getOrCreateSenseiByGoogleId } from "~/models/sensei";
import { PasskeyStrategy } from "./passkey-strategy.server";
import { verifyPasskeyAuthentication } from "~/models/passkey";

let _sessionStorage: SessionStorage;
let _authenticator: Authenticator<Sensei>;

const googleClientId = "129736193789-sqgen372tfq53l483j1v9br36uo4iuua.apps.googleusercontent.com";

export function sessionStorage(env: Env): SessionStorage {
  if (_sessionStorage) {
    return _sessionStorage;
  }

  _sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      path: "/",
      httpOnly: true,
      secure: true,
      secrets: [env.SESSION_SECRET],
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    },
  });
  return _sessionStorage;
}

export function getAuthenticator(env: Env): Authenticator<Sensei> {
  if (_authenticator) {
    return _authenticator;
  }

  const authenticator = new Authenticator<Sensei>(sessionStorage(env));
  authenticator.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.HOST}/auth/callbacks/google`,
  }, async ({ extraParams }) => {
    try {
      const googleUserId = await fetchGoogleUserId(extraParams.id_token);
      return await getOrCreateSenseiByGoogleId(env, googleUserId);
    } catch (e) {
      console.error("Login failed");
      console.error(e);
      throw e;
    }
  }), "google");

  authenticator.use(new PasskeyStrategy<Sensei>(async ({ authenticationResponse }) => {
    const sensei = await verifyPasskeyAuthentication(env, authenticationResponse);
    if (!sensei) {
      console.error("Passkey not matched");
      throw "Passkey not matched";
    }
    return sensei;
  }), "passkey");

  _authenticator = authenticator;
  return authenticator;
}

async function fetchGoogleUserId(idToken: string): Promise<string> {
  const url = "https://oauth2.googleapis.com/tokeninfo";
  const res = await fetch(`${url}?id_token=${idToken}`);
  const body = await res.json<{ aud: string, sub: string }>();
  if (body.aud !== googleClientId) {
    throw "ClientID not matched!";
  }
  return body.sub;
}
