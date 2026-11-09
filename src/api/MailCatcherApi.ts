import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';

/** One email as MailCatcher lists it (GET /messages). */
const CaughtEmailSchema = z.object({
  id: z.number().int(),
  sender: z.string(),
  recipients: z.array(z.string()),
  subject: z.string(),
  created_at: z.string(),
});
export type CaughtEmail = z.infer<typeof CaughtEmailSchema>;

/**
 * Reads the emails Toolshop sends, from MailCatcher (local Docker only).
 * Toolshop queues its emails and sends them once a minute, so waitForEmail polls.
 * The inbox is never emptied: other tests may be waiting for their own emails.
 */
export class MailCatcherApi {
  private readonly baseURL = process.env.MAILCATCHER_URL || 'http://localhost:1080';

  constructor(private readonly request: APIRequestContext) {}

  /** The newest email to exactly this address with this subject, or undefined. */
  async findEmail(recipient: string, subject: string): Promise<CaughtEmail | undefined> {
    const response = await this.request.get(`${this.baseURL}/messages`);
    if (!response.ok()) throw new Error(`MailCatcher GET /messages returned ${response.status()}`);
    const emails = z.array(CaughtEmailSchema).parse(await response.json());
    const address = `<${recipient.toLowerCase()}>`;
    return [...emails]
      .reverse()
      .find(
        (email) =>
          email.subject === subject && email.recipients.some((r) => r.toLowerCase() === address),
      );
  }

  /** Waits until the email arrives, checking every few seconds. */
  async waitForEmail(recipient: string, subject: string, timeoutMs = 90_000): Promise<CaughtEmail> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const email = await this.findEmail(recipient, subject);
      if (email) return email;
      if (Date.now() > deadline) {
        throw new Error(
          `No "${subject}" email to ${recipient} within ${timeoutMs / 1000}s. Toolshop sends queued emails once a minute; is the cron container running?`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }

  /** The plain-text body of an email, with whitespace collapsed. */
  async readText(id: number): Promise<string> {
    const response = await this.request.get(`${this.baseURL}/messages/${id}.plain`);
    if (!response.ok())
      throw new Error(`MailCatcher GET /messages/${id}.plain returned ${response.status()}`);
    return (await response.text()).replace(/\s+/g, ' ').trim();
  }
}
