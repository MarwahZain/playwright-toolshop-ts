import { ContactMessage, FileToUpload } from '../pages/ContactPage';
import { uniqueSuffix } from './unique';

/** One row of test-data/contact.json = one contact form test case. */
export type ContactCase = {
  id: string;
  who: 'guest' | 'customer';
  description: string;
  contact: Omit<ContactMessage, 'message'>;
  /** A fixed message text; when absent, a valid unique text is generated. */
  message?: string;
  attachment?: { name: string; mimeType: string; content: string };
  expected:
    | { sent: true; uploadStatus?: number }
    | { sent: false; field: 'subject' | 'message' | 'attachment'; error: string };
};

/** A valid message (50+ characters) with a unique marker, so the stored message can be found. */
export function uniqueMessage(): { marker: string; text: string } {
  const marker = `QA contact ${uniqueSuffix()}`;
  return { marker, text: `${marker}: automated test message from the Playwright suite.` };
}

/** Builds the row's attachment as an in-memory file, or undefined when the row has none. */
export function toFile(attachment?: ContactCase['attachment']): FileToUpload | undefined {
  return (
    attachment && {
      name: attachment.name,
      mimeType: attachment.mimeType,
      buffer: Buffer.from(attachment.content),
    }
  );
}
