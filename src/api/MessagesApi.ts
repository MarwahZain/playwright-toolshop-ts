import { APIResponse } from '@playwright/test';
import { z } from 'zod';
import { ApiClient } from './ApiClient';

/** Only what the lookup needs from each page; the found message gets the full check in the test. */
const MessagePageSchema = z.object({
  last_page: z.number().int().positive(),
  data: z.array(z.looseObject({ message: z.string() })),
});

/** Contact messages, read with the admin token. */
export class MessagesApi extends ApiClient {
  async list(page = 1): Promise<APIResponse> {
    return this.request.get(this.url('/messages'), { params: { page }, headers: this.headers });
  }

  /** Finds the message whose text contains the given marker. Returns undefined if none does. */
  async findByText(marker: string): Promise<unknown> {
    for (let page = 1; ; page++) {
      const response = await this.list(page);
      if (!response.ok())
        throw new Error(`GET /messages?page=${page} returned ${response.status()}`);
      const body = MessagePageSchema.parse(await response.json());
      const match = body.data.find((message) => message.message.includes(marker));
      if (match) return match;
      if (page >= body.last_page) return undefined;
    }
  }
}
