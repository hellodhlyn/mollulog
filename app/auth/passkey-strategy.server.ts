import { SessionStorage } from "@remix-run/cloudflare";
import { type AuthenticationResponseJSON } from "@simplewebauthn/server/script/deps";
import { AuthenticateOptions, Strategy } from "remix-auth";

export interface PasskeyStrategyOptions {
  authenticationResponse: AuthenticationResponseJSON;
};

export class PasskeyStrategy<User> extends Strategy<User, PasskeyStrategyOptions> {
  name = "passkey";

  async authenticate(request: Request, sessionStorage: SessionStorage, options: AuthenticateOptions): Promise<User> {
    const authenticationResponse = await request.json<AuthenticationResponseJSON>();
    return this.success(await this.verify({ authenticationResponse }), request, sessionStorage, options);
  }
}
