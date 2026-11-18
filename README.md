# playwright-toolshop-ts

Playwright + TypeScript test framework for [Toolshop](https://github.com/testsmith-io/practice-software-testing), a demo e-commerce app built for practicing test automation.

The suite covers the UI with page objects, reusable components and custom fixtures, and starts role-based tests already signed in through an API login.

## Tech stack

- [Playwright Test](https://playwright.dev) with TypeScript (strict mode)
- ESLint with `eslint-plugin-playwright`, Prettier
- dotenv for environment configuration

## Prerequisites

- Node.js 20 or later
- Toolshop running locally with Docker (UI on `localhost:4200`, API on `localhost:8091`), see [docs/TOOLSHOP-LOCAL-SETUP.md](docs/TOOLSHOP-LOCAL-SETUP.md), or access to the public demo site

## Setup

```bash
npm ci
npx playwright install
cp .env.example .env
```

`.env` sets `TEST_ENV` (default `local`) and, optionally, other accounts. See [Environments](#environments).

## Environments

One variable decides where the suite runs, the way Spring profiles pick a configuration:

```bash
npx playwright test                    # local (default)
TEST_ENV=uat npx playwright test       # the same suite against UAT
TEST_ENV=sit npm run test:smoke        # the smoke set against SIT
```

| `TEST_ENV` | Application                                                               | Data     | Tests that run |
| ---------- | ------------------------------------------------------------------------- | -------- | -------------- |
| `local`    | Toolshop in Docker on your machine (localhost:4200 / 8091)                | your own | all            |
| `qa`       | Toolshop in Docker on the CI runner, fresh database per run               | fresh    | all            |
| `sit`      | https://with-bugs.practicesoftwaretesting.com (a version with known bugs) | shared   | `@readonly`    |
| `uat`      | https://practicesoftwaretesting.com (stable)                              | shared   | `@readonly`    |

- URLs live only in `src/config/environments.ts`. `BASE_URL` and `API_URL` are ignored (with a warning), so a leftover value can never point a run at the wrong place.
- On shared environments the config runs only `@readonly` tests: tests that read and cannot change shared state. Creating data, checkout, contact messages, email, visual tests and wrong-password logins (they count towards an account lockout) are not `@readonly`.
- A `--grep` on the command line replaces that filter, so every `@smoke` test must also be `@readonly`; `npm run check:tags` enforces it.
- On `sit`, failures are expected: it runs the version of Toolshop with built-in bugs.

### Credentials

Accounts come from `src/config/accounts.ts`: `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `CUSTOMER_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` if set, otherwise Toolshop's public seed accounts in `test-data/login.json`, so the suite runs right after cloning. Tests read the customer's name from there too, so another account needs no code change.

These accounts are published by the Toolshop project and expose nothing. Credentials for a real environment do not belong in the repo: keep them in `.env` locally and in GitHub Secrets for CI.

## Running tests

```bash
npm test                                   # all projects
npx playwright test --project=chromium     # guest tests in one browser
npx playwright test --project=customer     # tests that start signed in as a customer
npx playwright test --project=api          # API tests only
npx playwright test --project=hybrid       # hybrid API + UI tests
npx playwright test --project=email        # email flows (needs local Docker with MailCatcher)
npm run test:smoke                         # smoke set: guest (Chromium), customer, admin
npx playwright test --ui                   # interactive runner
npx playwright show-report                 # open the last HTML report
```

## Reports

Every run writes two reports:

| Report                                        | For                                                                              | Open with                            |
| --------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| Playwright HTML (`playwright-report/`)        | Debugging one run: errors, screenshots, traces                                   | `npm run report:html`                |
| Allure (`allure-results/` → `allure-report/`) | The quality picture: suites, tags, failure categories, environment, trends in CI | `npm run report:allure` (needs Java) |

Allure sorts failures into categories defined in `src/reporting/allure.ts`: visual differences, contract mismatches, element not found, timeouts, other assertion failures (likely product defects) and other errors (test code or environment). Tests marked as known bugs pass while the bug is present, so they do not show up as failures.

Every failed test keeps a screenshot, a video and a Playwright trace (open it from either report, or with `npx playwright show-trace <file>`). In CI a failed test is retried once; a test that passes on retry is reported as flaky.

## Tags

Tags decide when a test runs:

| Tag           | Meaning                                                              |
| ------------- | -------------------------------------------------------------------- |
| `@regression` | every test; the full run                                             |
| `@smoke`      | a few fast, read-only tests of the critical paths; run on every push |
| `@readonly`   | safe on shared environments: reads only, changes no shared state     |

Every test carries `@regression`, and a small set also carries `@smoke`. `npm run check:tags` fails if a test is missing `@regression`, or if a `@smoke` test is not `@readonly`.

Other tags describe the kind of test, for filtering: `@api`, `@hybrid`, `@mocked`, `@email`, `@e2e`, `@visual`.

```bash
npx playwright test --grep @smoke --project=chromium
npx playwright test --grep @regression
```

## Visual snapshots

`tests/visual/` compares the login and contact pages pixel by pixel with approved baseline images. Fonts render differently on macOS and Linux, so baselines are made and compared inside the official Playwright Docker image, never directly on macOS (there the tests are skipped).

```bash
npm run visual          # compare with the baselines (Docker must be running)
npm run visual:update   # approve an intended change: regenerate the baselines, review, commit
```

On a failure, the HTML report shows the expected image, the actual one and a diff.

Inside the container, `scripts/docker-forward.mjs` forwards `localhost:4200` and `localhost:8091` to the Mac, because the shop's dev server only accepts requests addressed to `localhost`.

## How authentication works

`src/global-setup.ts` runs once before the test run. It logs in as customer and as admin through `POST /users/login` and writes each token to `.auth/storage-state.<role>.json`.

The `customer` and `admin` projects load those files, so their tests open the app already signed in and skip the login screen. Guest tests run in the `chromium`, `firefox` and `webkit` projects with no saved session. The login form itself is tested in `tests/ui/guest/login.spec.ts`.

`.auth/` is gitignored because the files contain valid tokens.

## Project structure

```
src/
  api/                API clients, one per resource
  pages/              page objects
  pages/components/   header, cart badge, product card
  fixtures/           custom fixtures that provide page objects to tests
  utils/              shared helpers
  config/             environments (TEST_ENV) and accounts
  reporting/          Allure failure categories and environment info
  global-setup.ts     API login and saved sessions per role
test-data/            JSON data for data-driven tests
tests/api/            API tests, run without a browser
tests/hybrid/         arrange through the API, assert in the browser
tests/email/          flows that send email, read from MailCatcher (local only)
tests/visual/         visual snapshots, run in the Playwright Docker image
tests/ui/guest/       UI tests that run signed out
tests/ui/customer/    UI tests that run signed in as a customer
tests/ui/admin/       UI tests that run signed in as an admin
docs/TOOLSHOP-LOCAL-SETUP.md  running Toolshop locally with Docker
docs/ROADMAP.md       milestones and progress
docs/LEARNINGS.md     notes and lessons from building the suite
```

## Code quality

```bash
npm run lint
npm run format:check
npm run typecheck     # TypeScript type check (Playwright itself runs tests without checking types)
npm run check:tags    # every test has @regression, every @smoke test is @readonly
```

## CI

| Workflow                  | When                                                  | What                                                                                  |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `ci.yml`                  | every push to `main`, every pull request, on demand   | **quality** (lint, format, type and tag checks), then **smoke** on `uat`              |
| `test-on-environment.yml` | on demand: Actions, Test on environment, Run workflow | the `smoke` or `full` suite on `sit` or `uat`                                         |
| `run-tests.yml`           | called by other workflows                             | the shared steps: one environment, one suite                                          |
| `regression.yml`          | on demand, work in progress                           | the full suite against Toolshop in Docker on the runner (the future `qa` environment) |

**Environments and secrets.** The repository has GitHub Environments `sit` and `uat`. Each holds its own accounts as secrets (`CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) and the customer's name as a variable (`CUSTOMER_NAME`). A job that declares `environment: uat` receives UAT's values; `uat` also requires an approval and accepts only `main`. Repository-level secrets with the same names are the defaults, used by the PR smoke job, which declares no environment so it never waits for approval. If a demo account gets locked by other visitors (HTTP 423), replace that secret and rerun; no code changes.

From a terminal:

```bash
gh workflow run test-on-environment.yml -f environment=uat -f suite=smoke
gh run watch
```

Every run keeps its HTML report and Allure results as artifacts for 14 days, named by environment and suite.
