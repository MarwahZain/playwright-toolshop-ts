# CI/CD and environments

What Milestone 6 built, how it fits together, and every command used along the way.
Advanced topics (Toolshop in Docker on the runner, shards, published reports, nightly runs, Jenkins) continue in M9, see [ROADMAP.md](ROADMAP.md).

## The big picture

```
                    TEST_ENV=local | qa | sit | uat
                               │
        ┌──────────────────────┴───────────────────────┐
   On your machine                                 In GitHub Actions
   .env.<env> (personal, git-ignored)              GitHub Environment secrets and variables
        │                                               │
        └──────────► src/config/environments.ts ◄───────┘   (URLs, shared or not)
                     src/config/accounts.ts                 (customer and admin accounts)
```

One variable picks the environment, exactly like a Spring profile (`-Dspring.profiles.active=uat`). URLs are committed; accounts and tokens never are.

## Environments

| `TEST_ENV`        | Application                                                                  | Data     | Tests that run              |
| ----------------- | ---------------------------------------------------------------------------- | -------- | --------------------------- |
| `local` (default) | Toolshop in Docker on your machine (localhost:4200 / 8091)                   | your own | all                         |
| `qa`              | Toolshop in Docker on the CI runner, fresh database per run (M9)             | fresh    | all                         |
| `sit`             | https://with-bugs.practicesoftwaretesting.com (a version with built-in bugs) | shared   | `@readonly`                 |
| `uat`             | https://practicesoftwaretesting.com (stable)                                 | shared   | `@readonly`, approval in CI |

- **Shared environments run only `@readonly` tests**: tests that read and cannot change shared state. Creating data, checkout, contact messages, email, visual tests, add to cart and wrong-password logins are not `@readonly`.
- **Wrong passwords matter**: Toolshop locks a customer after 3 failed logins, with no automatic unlock (admins are never locked). On a shared site anyone can lock a demo account, which is why each environment has its own account in secrets.
- **Settings precedence**, strongest first: real environment variable (terminal, or GitHub secrets in CI) > `.env.<TEST_ENV>` > `.env` > the public demo accounts in `test-data/login.json`.

## What was built, step by step

### Part A: reporting and failure evidence

1. **Reporters**: `list` (console), `html` (debug one run), `allure-playwright` (suites, tags, trends), `github` (annotations on pull requests, CI only).
2. **Allure failure categories** (`src/reporting/allure.ts`): visual differences, contract mismatches, element not found, timeouts, other assertion failures, other errors. The environment widget shows the environment, URLs and whether data is shared.
3. **Evidence on failure**: `trace` and `video` set to `retain-on-failure`, so every failed test keeps a screenshot, a video and a trace, locally too.
4. **CI settings**: 2 workers (leaves room for the application on the same runner) and 1 retry (a pass on retry is reported as flaky); locally no retries.

### B1: the CI gate (`.github/workflows/ci.yml`)

- Runs on every push to `main`, every pull request, and on demand.
- **quality** job, no browser: lint, format check, type check, tag check.
- **smoke** job, only after quality passes: the `@smoke` set (guest UI in Chromium, plus the customer and admin saved sessions) on `uat`, with accounts from repository secrets. It declares no environment, so a pull request never waits for an approval.
- Cancels outdated runs (`concurrency`), read-only permissions, reports kept as artifacts for 14 days.
- `main` is protected by a ruleset: no force push or deletion, changes only through pull requests, and `quality` and `smoke` must pass.

### B2: switching environments in code

- `src/config/environments.ts`: the environment map; URLs live only here. `BASE_URL` and `API_URL` are ignored with a warning, so a leftover value can never point a run at the wrong place.
- `src/config/accounts.ts`: customer (email, password, name) and admin; tests read the customer's name from here, never from `login.json`.
- `src/config/load-env.ts`: loads `.env.<TEST_ENV>` and then `.env`, never overwriting a value that is already set.
- `@readonly` tags on 87 tests; `npm run check:tags` checks that every test has `@regression` and that every `@smoke` test is `@readonly` (a `--grep` on the command line replaces the config's filter).

### B3: GitHub Environments and the Test on environment button

- **Repository secrets and variables** (Settings → Secrets and variables → Actions): the defaults, used by the PR smoke job.
- **Environments** (Settings → Environments): `sit` and `uat`, each with the secrets `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and the variable `CUSTOMER_NAME`. The most specific value wins: environment over repository.
- **UAT protection**: a required reviewer (approval before the job starts and receives UAT's secrets) and deployment from `main` only.
- **`run-tests.yml`**: a reusable workflow (`workflow_call`) with two inputs, `environment` and `suite` (`smoke` or `full`). Its job declares `environment: <input>`, so it receives that environment's secrets and waits for approval on `uat`.
- **`test-on-environment.yml`**: the Run workflow button with environment and suite dropdowns; calls `run-tests.yml` with `secrets: inherit`. Runs are titled "Tests on uat (smoke)".
- **Secrets diagnostic**: the first step of each test job prints, for every account setting, whether it arrived, its length, stray whitespace and the email domain, never the value.

### Wrap-up

- GitHub actions at their current major version (v7).
- Dependabot (`.github/dependabot.yml`): weekly grouped PRs for GitHub Actions and npm; `@playwright/test` is upgraded by hand together with the Playwright Docker image used for visual snapshots.
- README badges, release tag `v1.0`.

## Workflows at a glance

| Workflow                  | Trigger                              | Purpose                                               |
| ------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `ci.yml`                  | push to `main`, pull request, manual | quality checks, then smoke on `uat`                   |
| `test-on-environment.yml` | manual (environment, suite)          | run smoke or the full allowed suite on `sit` or `uat` |
| `run-tests.yml`           | called by other workflows            | shared steps for one environment and one suite        |
| `regression.yml`          | manual, work in progress (M9)        | full suite against Toolshop in Docker on the runner   |

## Commands

### Running tests

```bash
npx playwright test                         # everything, on local
npm run test:smoke                          # smoke set: guest (Chromium), customer, admin
TEST_ENV=uat npm run test:smoke             # smoke on UAT
TEST_ENV=sit npm run test:smoke             # smoke on SIT (failures expected: buggy version)
TEST_ENV=uat npx playwright test            # every @readonly test on UAT, all browsers
npx playwright test --project=api           # one project
npx playwright test --grep @smoke           # by tag
TEST_ENV=uat npx playwright test --list     # what would run, without running it
```

### Quality checks (the same as the CI quality job)

```bash
npm run lint
npm run format:check
npm run typecheck        # Playwright runs TypeScript without checking types
npm run check:tags
```

### Reports

```bash
npm run report:html                                   # last Playwright HTML report
npm run report:allure                                 # build and open the Allure report (needs Java)
npx playwright show-trace test-results/<test>/trace.zip
```

### Visual snapshots (in the Playwright Docker image)

```bash
npm run visual          # compare with the baselines
npm run visual:update   # approve an intended change, then review and commit the images
```

### Local settings files

```bash
cp .env.example .env    # then set TEST_ENV and, per environment, create .env.uat / .env.sit
git check-ignore -v .env.uat .env.sit    # proves Git ignores them
git status                               # they must not appear
```

### GitHub CLI

```bash
gh workflow run test-on-environment.yml -f environment=uat -f suite=smoke   # start a run
gh workflow run test-on-environment.yml --ref <branch> -f environment=sit -f suite=full
gh run watch                                         # follow the latest run
gh run list --workflow=Regression --limit 5          # recent runs of one workflow
gh run view <run-id> --log-failed | tail -60         # only the failed step's log
gh secret set CUSTOMER_PASSWORD --env uat            # set an environment secret (asks for the value)
gh secret list --env uat                             # secret names only, never values
```

### Git workflow used for M6

```bash
git checkout main && git pull
git checkout -b ci/<topic>                           # never commit on main
git mv .github/workflows/playwright.yml .github/workflows/ci.yml   # rename, history kept
git add -A && git commit -m "ci: ..." && git push -u origin ci/<topic>
git log --follow .github/workflows/ci.yml            # history across the rename
git tag -a v1.0 -m "..." && git push origin v1.0     # release tag after merging
```

## Lessons from M6

- **Separate settings from secrets.** URLs and flags are committed; passwords and tokens live in git-ignored files locally and in encrypted secrets in CI. The code reads both the same way, through environment variables.
- **A shared environment is shared with strangers.** Public demo accounts got locked by other people's failed logins twice. Own accounts per environment, kept in secrets, turn that into a one-secret change instead of a code change.
- **Make secret problems visible without leaking them.** A 401 with masked values says nothing; printing "set, 37 characters" found the wrong account in one run.
- **Approvals belong on deliberate runs, not on pull request checks.** The UAT gate applies to the manual workflow; the PR smoke job uses repository secrets and never waits.
- **A workflow's Run button appears only once the file is on `main`.** After that, "Use workflow from" can run the version from any branch, so new workflows are merged early and developed on branches.
- **Keep pipelines thin.** All logic lives in npm scripts, so GitHub Actions and, later, Jenkins call the same commands.
- **Running the application inside CI is DevOps work** (nginx configuration, file ownership on Linux, startup order). It pays off with isolated, reproducible runs, and continues in M9.
