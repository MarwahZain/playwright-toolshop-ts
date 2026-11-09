import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { LoginRequest, LoginResponseSchema, RegisterRequest } from './schemas';

export class AuthApi extends ApiClient {
  async login(email: string, password: string): Promise<APIResponse> {
    const body: LoginRequest = { email, password };
    return this.request.post(this.url('/users/login'), { data: body });
  }

  /** Logs in and returns the access token, failing with a clear message if login does not succeed. */
  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    if (!response.ok()) {
      throw new Error(`Login as ${email} failed: ${response.status()} ${await response.text()}`);
    }
    return LoginResponseSchema.parse(await response.json()).access_token;
  }

  async register(user: RegisterRequest): Promise<APIResponse> {
    return this.request.post(this.url('/users/register'), { data: user });
  }

  /** Requests a password reset. Toolshop sets a new password and emails it (queued, sent once a minute). */
  async forgotPassword(email: string): Promise<APIResponse> {
    return this.request.post(this.url('/users/forgot-password'), { data: { email } });
  }

  /** Returns the signed-in user. Needs a client created with a token. */
  async me(): Promise<APIResponse> {
    return this.request.get(this.url('/users/me'), { headers: this.headers });
  }
}
