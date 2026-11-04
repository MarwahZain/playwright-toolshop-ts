## MIMOS: Core UI tests

One CI note: GitHub Actions can’t reach your local Docker, which is why CI targets the public site. If you later want CI on the local stack too, the workflow can clone the Toolshop repo and run docker compose up as a service step

mkdir ~/projects/playwright-toolshop-ts && cd $_
npm init playwright@latest # TypeScript, tests folder, add GitHub Actions: yes
npm i -D dotenv zod eslint prettier
git init && gh repo create playwright-toolshop-ts --public --source=. --push

TypeScript only adds type annotations on top

Keep strict: true

eslint-plugin-playwright: it flags waitForTimeout, missing await, and focused test.only, which enforces your outcome automatically.
zero waitForTimeout

'''
npm run lint
npm run format
'''
run
'''npm run format:check''' as the first CI step, so a badly formatted PR fails before any test runs.

.vscode/extensions.json
The Playwright extension, it lets you run and debug single tests from the editor gutter and pick locators on the live page.

playwright.config.ts
testIdAttribute: 'data-test', //Putting it in the top-level use applies it to every project. Now getByTestId reads Toolshop’s data-test attributes directly
Without this setting, Playwright looks for data-testid and finds nothing on Toolshop. i.e this can be altered in favor of your project.

run tests with:
npx playwright test --grep @smoke --project=chromium
npx playwright test tests/ui/login.spec.ts --project=chromium
npx playwright test tests/ui/login.spec.ts --project=chromium --headed
npx playwright test --ui # visual runner: watch steps, time-travel through each action
npx playwright test --debug # opens the inspector and pauses on every step

#gitHub
git init -b main
git add .
git status # .env must NOT be listed; .env.example should be
git commit -m "chore: bootstrap Playwright + TypeScript framework for Toolshop"

#github CLI
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

selectOption() returns the selected values (Promise<string[]>), but I typed the action as () => Promise<void>, so TypeScript rejects anything that returns a value.
change it to Promise<unknown>

using css selectors will trigger the no-raw-locators rule and it will flag it
