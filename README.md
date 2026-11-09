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

`.env` holds the target environment. It points to the local Docker stack by default; switch the commented lines to run against the public site at `practicesoftwaretesting.com`.

### Credentials

Credentials default to Toolshop's public seed accounts in `test-data/login.json`, so the suite runs right after cloning. Override them in `.env` for any other environment.

These accounts are published by the Toolshop project and expose nothing. Credentials for a real environment do not belong in the repo: keep them in `.env` locally and in GitHub Secrets for CI.

## Running tests

```bash
npm test                                   # all projects
npx playwright test --project=chromium     # guest tests in one browser
npx playwright test --project=customer     # tests that start signed in as a customer
npx playwright test --project=api          # API tests only
npx playwright test --project=hybrid       # hybrid API + UI tests
npx playwright test --project=email        # email flows (needs local Docker with MailCatcher)
npx playwright test --grep @smoke          # smoke tests only
npx playwright test --ui                   # interactive runner
npx playwright show-report                 # open the last HTML report
```

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
  global-setup.ts     API login and saved sessions per role
test-data/            JSON data for data-driven tests
tests/api/            API tests, run without a browser
tests/hybrid/         arrange through the API, assert in the browser
tests/email/          flows that send email, read from MailCatcher (local only)
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
```
