## MIMOS: Core UI tests

One CI note: GitHub Actions can’t reach your local Docker, which is why CI targets the public site. If you later want CI on the local stack too, the workflow can clone the Toolshop repo and run docker compose up as a service step

mkdir ~/projects/playwright-toolshop-ts && cd $_
npm init playwright@latest # TypeScript, tests folder, add GitHub Actions: yes
npm i -D dotenv zod eslint prettier
git init && gh repo create playwright-toolshop-ts --public --source=. --push

TypeScript only adds type annotations on top
Keep strict: true

# lint

eslint-plugin-playwright: it flags waitForTimeout, missing await, and focused test.only, which enforces your outcome automatically.
zero waitForTimeout

'''
npm run lint
npm run format
'''
run
'''npm run format:check''' as the first CI step, so a badly formatted PR fails before any test runs.

# .vscode/extensions.json

The Playwright extension, it lets you run and debug single tests from the editor gutter and pick locators on the live page.

# playwright.config.ts

testIdAttribute: 'data-test', //Putting it in the top-level use applies it to every project. Now getByTestId reads Toolshop’s data-test attributes directly
Without this setting, Playwright looks for data-testid and finds nothing on Toolshop. i.e this can be altered in favor of your project.

# run tests with:

npx playwright test --grep @smoke --project=chromium
npx playwright test tests/ui/login.spec.ts --project=chromium
npx playwright test tests/ui/login.spec.ts --project=chromium --headed
npx playwright test --ui # visual runner: watch steps, time-travel through each action
npx playwright test --debug # opens the inspector and pauses on every step

# gitHub

git init -b main
git add .
git status # .env must NOT be listed; .env.example should be
git commit -m "chore: bootstrap Playwright + TypeScript framework for Toolshop"

# github CLI

brew install gh # if not installed
gh auth login # GitHub.com → HTTPS → login with browser
gh repo create playwright-toolshop-ts --public --source=. --remote=origin --push \
--description "Playwright + TypeScript test framework for the Toolshop demo app: UI, API, hybrid and mocked tests"

git init -b main
git add .
git status # confirm .env is not listed
git commit -m "chore: bootstrap Playwright + TypeScript framework for Toolshop"
git remote add origin https://github.com/<your-username>/playwright-toolshop-ts.git
git push -u origin main

git checkout -b feat/m1-ui-tests
git add .
git commit -m "test: add valid customer login test"
git push -u origin feat/m1-ui-tests

If an account does get locked, reseeding resets it:
'''
docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed
'''

# Typescript

selectOption() returns the selected values (Promise<string[]>), but I typed the action as () => Promise<void>, so TypeScript rejects anything that returns a value.
change it to Promise<unknown>

using css selectors will trigger the no-raw-locators rule and it will flag it

# What a project is

A Playwright project is a named set of settings that a group of tests runs with.
and three projects (chromium, firefox, webkit) run everytime
A project can set much more than the browser: which test files it runs, whether the browser starts logged in (storageState), and which other projects must finish first (dependencies).

# “Projects per role” uses that to say:

these tests run as a guest, these as a customer, these as an admin.

## The four projects

** setup: **
runs the auth setup file only. It logs in through the API and writes .auth/customer.json and .auth/admin.json.

# guest:

no saved state. Runs tests for logged-out behavior: the login form, search, filter, sort, pagination.

# customer:

loads .auth/customer.json. Runs tests that need a logged-in shopper: account page, favorites, later checkout.

# admin:

loads .auth/admin.json. Runs admin tests: dashboard, product management.
customer and admin list setup as a dependency, so Playwright always runs setup first. If setup fails, those projects are skipped with a clear message instead of running and failing on “unauthorized”.

How tests are assigned to a role

The simplest way is by folder:

tests/
├── auth.setup.ts
└── ui/
├── guest/ login, search, filter, sort, pagination, smoke
├── customer/ account, favorites, checkout
└── admin/ dashboard, products
Each project uses testMatch to pick its folder

# workers

Workers can be translated to how many sessions at a time are open in parallel
Workers are separate processes that run your tests at the same time. Each worker starts its own browser and picks up tests one by one
When fullyParallel: true is set, Playwright spreads even the tests inside a single file across workers, not only whole files.
undefined: depends on the machine
