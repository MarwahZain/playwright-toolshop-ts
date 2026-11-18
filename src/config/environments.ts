import './load-env';

/**
 * Test environments, selected with TEST_ENV (default: local).
 * Like Spring profiles: one name picks a whole set of settings.
 *
 *   TEST_ENV=uat npx playwright test
 *
 * URLs live only here. Accounts come from environment variables (see accounts.ts),
 * so each environment can use its own accounts without code changes.
 */
export type EnvironmentName = 'local' | 'qa' | 'sit' | 'uat';

export interface TestEnvironment {
  name: EnvironmentName;
  description: string;
  baseURL: string;
  apiURL: string;
  /** Only where we run Toolshop ourselves; shared environments have no MailCatcher. */
  mailCatcherURL?: string;
  /** Shared with other people: only @readonly tests run there. */
  sharedData: boolean;
}

const localStack = {
  baseURL: 'http://localhost:4200',
  apiURL: 'http://localhost:8091',
  mailCatcherURL: 'http://localhost:1080',
  sharedData: false,
};

export const environments: Record<EnvironmentName, TestEnvironment> = {
  local: { name: 'local', description: 'Toolshop in Docker on this machine', ...localStack },
  qa: {
    name: 'qa',
    description: 'Toolshop in Docker on the CI runner, fresh database per run',
    ...localStack,
  },
  sit: {
    name: 'sit',
    description: 'Public Toolshop with known bugs (sprint5-with-bugs)',
    baseURL: 'https://with-bugs.practicesoftwaretesting.com',
    apiURL: 'https://api-with-bugs.practicesoftwaretesting.com',
    sharedData: true,
  },
  uat: {
    name: 'uat',
    description: 'Public Toolshop, stable (sprint5)',
    baseURL: 'https://practicesoftwaretesting.com',
    apiURL: 'https://api.practicesoftwaretesting.com',
    sharedData: true,
  },
};

function resolveEnvironment(): TestEnvironment {
  const requested = (process.env.TEST_ENV || 'local').trim().toLowerCase();
  const names = Object.keys(environments);
  if (!names.includes(requested)) {
    throw new Error(`Unknown TEST_ENV "${requested}". Use one of: ${names.join(', ')}.`);
  }

  // Old-style URL variables would silently point a run at the wrong place, so they are
  // ignored. Warn once, in the main process only (workers load this module too).
  const ignored = ['BASE_URL', 'API_URL', 'MAILCATCHER_URL'].filter((v) => process.env[v]);
  if (ignored.length > 0 && !process.env.TEST_WORKER_INDEX) {
    console.warn(
      `[environments] ${ignored.join(', ')} ignored: URLs come from TEST_ENV ` +
        `(src/config/environments.ts). Remove them from .env.`,
    );
  }
  return environments[requested as EnvironmentName];
}

/** The environment this run targets. */
export const testEnv: TestEnvironment = resolveEnvironment();
