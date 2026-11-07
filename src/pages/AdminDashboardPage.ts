import { BasePage } from './BasePage';

/** The landing page for admins. Only reachable with an admin session. */
export class AdminDashboardPage extends BasePage {
  protected readonly path = '/admin/dashboard';
}
