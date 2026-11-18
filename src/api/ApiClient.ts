import { APIRequestContext } from '@playwright/test';
import { testEnv } from '../config/environments';

/**
 * Base for all API clients. Builds full URLs from the environment's API URL, because the
 * request fixture's baseURL points at the UI, not the API.
 * Pass a token to send it as a Bearer header on every call.
 */
export abstract class ApiClient {
  protected readonly apiURL: string;

  constructor(
    protected readonly request: APIRequestContext,
    private readonly token?: string,
  ) {
    this.apiURL = testEnv.apiURL;
  }

  protected url(path: string): string {
    return `${this.apiURL}${path}`;
  }

  protected get headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
