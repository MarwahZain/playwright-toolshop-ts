import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';

/** What a contact message contains. Name and email are only asked of guests. */
export type ContactMessage = {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** The option value, e.g. "customer-service"; empty means none chosen. */
  subject: string;
  message: string;
};

/** A file for the attachment field, created in memory: nothing is stored in the repo. */
export type FileToUpload = { name: string; mimeType: string; buffer: Buffer };

export type ContactField =
  'first-name' | 'last-name' | 'email' | 'subject' | 'message' | 'attachment';

export class ContactPage extends BasePage {
  protected readonly path = '/contact';

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly attachment: Locator;
  readonly submitButton: Locator;
  /** Shown to signed-in users instead of the name and email fields. */
  readonly greeting: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
    this.subject = page.getByTestId('subject');
    this.message = page.getByTestId('message');
    this.attachment = page.getByTestId('attachment');
    this.submitButton = page.getByTestId('contact-submit');
    this.greeting = page.getByText(/please fill out this form to submit your message/);
    this.confirmation = page.getByText('Thanks for your message! We will contact you shortly.');
  }

  /** The error shown under a field, e.g. fieldError('attachment'). */
  fieldError(field: ContactField): Locator {
    return this.page.getByTestId(`${field}-error`);
  }

  /** Fills the form. Guest fields are only filled when given; the file is attached when given. */
  async fillForm(contact: ContactMessage, file?: FileToUpload): Promise<void> {
    if (contact.firstName !== undefined) await this.firstName.fill(contact.firstName);
    if (contact.lastName !== undefined) await this.lastName.fill(contact.lastName);
    if (contact.email !== undefined) await this.email.fill(contact.email);
    if (contact.subject) await this.subject.selectOption(contact.subject);
    await this.message.fill(contact.message);
    if (file) await this.attachment.setInputFiles(file);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fills and submits. When a file is attached, also waits for its upload request
   * (POST /messages/{id}/attach-file) and returns that response, so a test can check it.
   */
  async send(contact: ContactMessage, file?: FileToUpload): Promise<Response | undefined> {
    await this.fillForm(contact, file);
    const upload = file
      ? this.page.waitForResponse((res) => res.url().endsWith('/attach-file'))
      : undefined;
    await this.submit();
    return upload;
  }
}
