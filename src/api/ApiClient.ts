import { APIRequestContext } from '@playwright/test';

/**
 * Base for all API clients. Builds full URLs from API_URL, because the
 * request fixture's baseURL points at the UI, not the API.
 * Pass a token to send it as a Bearer header on every call.
 */
export abstract class ApiClient {
  protected readonly apiURL: string;

  constructor(
    protected readonly request: APIRequestContext,
    private readonly token?: string,
  ) {
    const apiURL = process.env.API_URL;
    if (!apiURL) {
      throw new Error('API_URL is missing. Set it in .env or in the CI workflow.');
    }
    this.apiURL = apiURL;
  }

  protected url(path: string): string {
    return `${this.apiURL}${path}`;
  }

  protected get headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
