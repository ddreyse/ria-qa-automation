# RIA Money Transfer - QA Engineer Coding Challenge

UI end-to-end tests using **Selenium WebDriver, JavaScript and Mocha**, plus a **Postman** collection for API validation.

## Requirements coverage

| ID | Acceptance criterion | Observed result |
| --- | --- | --- |
| CALC-01 | Alphabetic input displays `Please enter a valid amount` | **FAIL** - The field rejects letters, but the required message is not displayed. |
| CALC-01B | Additional check: alphabetic input is rejected | **PASS** |
| CALC-02 | Destination dropdown allows country selection | **PASS** - Haiti / HTG selected. |
| CALC-03 | Convert 25,000 CLP to HTG and validate the received amount | **PASS** |
| CALC-04 | Updating the send amount updates the conversion | **PASS** |
| REG-01 | Get Started opens the secure RIA site; registration link, phone/email and password fields are visible | **PASS** |
| REG-02 | Register opens the country-selection page | **FAIL (BLOCKED)** - RIA explicitly prevents account registration from Chile. The test detects the restriction and reports a descriptive failure. |
| SMOKE | Public RIA page loads | **PASS** - Additional infrastructure check. |
| API-GET | GET `/posts/`: status 200, nonempty titles/bodies, no `zombie` | **PASS** - 4 Postman assertions. |
| API-POST | POST `/post`: status 200/201, required toppings, no `chicken` | **PASS** - 4 Postman assertions. |

The original acceptance criteria remain unchanged. CALC-01B is an additional behavioral check, **not** a replacement for CALC-01.

## Prerequisites

- Node.js and npm
- Google Chrome
- Internet access
- Postman (for API tests)

## Installation

From the project root:

```bash
npm ci
```

If PowerShell blocks `npm.ps1`, run `npm.cmd` instead of `npm`.

## Run Selenium tests

```bash
npm test
npm run test:calculator
npm run test:registration
```

On Windows PowerShell, use `npm.cmd` for the commands above if needed.

Without the flag, REG-02 executes its full assertion and may fail in that environment.

This flag **explicitly skips REG-02** after navigation to registration. It does not validate the country-selection page and does not automatically detect a regional restriction. Without the flag, REG-02 executes its full assertion and may fail in that environment.

Optional settings:

```powershell
$env:HEADLESS = '1'
$env:RIA_BASE_URL = 'https://www.riamoneytransfer.com/en-cl/'
npm.cmd test
```

The default public-site URL uses the `en-cl` route to test CLP as the sending currency. Some UI labels may appear in English or Spanish depending on localization.

## Run Postman tests

1. Open Postman and import `postman/RIA_Postman_Collection.json`.
2. Run the full collection.
3. Review the assertions for both requests:
   - `GET https://jsonplaceholder.typicode.com/posts/`
   - `POST https://httpbin.org/post`

The POST request uses the JSON body specified in the challenge, including the toppings `bacon`, `cheese` and `mushroom`.

## Test design

- **Page Object Model:** UI interactions are separated from test assertions.
- **Independent tests:** Selenium starts a fresh browser session for each scenario.
- **Explicit waits:** Tests wait for observable UI states rather than relying on fixed sleeps.
- **Localized selectors:** Relevant controls support the English and Spanish labels observed during testing.
- **Conversion assertion:** CALC-03 checks the received amount against the rate displayed by RIA, using a tolerance for rate precision and rounding. The test does not use a hard-coded exchange rate.
- **Transparent results:** Failed and unverified acceptance criteria are reported, not converted into artificial passes.

## Execution results

### Selenium

The latest complete execution on November 16, 2026 reported 6 passing, 1 failing and 1 pending.

On November 17, 2026, REG-02 was updated and executed independently. It now detects the regional registration restriction and reports a descriptive failure instead of being skipped.

The complete Selenium suite was executed on November 17, 2026.

Results: 6 passed, 2 failed.

CALC-01: The application does not display the required validation message.

REG-02: Account registration is blocked from Chile. The test detects the regional restriction and reports a descriptive failure.

Both failures are documented in docs/QA_NOTES.md.

### Postman

- 8 assertions passed.
- 0 failures.

### Conversion validation

During testing, RIA displayed a promotional exchange rate of **0.131066 HTG per CLP**.

For 25,000 CLP, the calculator returned **3,276.65 HTG**, matching the displayed rate.

This is a recorded test result, not a fixed exchange rate.

### Findings and limitations

**CALC-01 - Requirement discrepancy**

Entering alphabetic characters (`abc`) leaves the amount field empty. The required message `Please enter a valid amount` is not displayed, even after the field loses focus.

**REG-02 - Regional restriction**

RIA displays the following message:

"No se ha podido registrar la cuenta. Según tu ubicación actual, no puedes registrar una cuenta en Chile."

The automated test detects this restriction and reports:

`REG-02 BLOCKED: Registration is unavailable from Chile.`

The country-selection acceptance criterion remains unverified because the application prevents continuing from the tested location.

Further details are available in `docs/QA_NOTES.md`.

**Selenium:** 6 passing, 1 failing (CALC-01), 1 pending (REG-02, explicitly skipped using `RIA_REGISTRATION_BLOCKED=1`). The six passing tests include the additional CALC-01B and SMOKE checks.

**Postman:** 8 assertions passing, 0 failing.

For the observed CALC-03 execution, RIA displayed a promotional rate of **0.131066 HTG per CLP**, resulting in **3,276.65 HTG for 25,000 CLP**. This is a recorded test result, not a fixed rate for future runs.

### Findings and limitations

- **CALC-01 - Requirement discrepancy:** Inputting `abc` leaves the amount field empty. The exact expected message `Please enter a valid amount` was not displayed, including after the field lost focus.
- **REG-02 - Regional limitation:** The registration flow showed a Chile-related restriction during testing. Country selection has not been confirmed from this environment; REG-02 is marked pending only when the environment flag is set.

Further details: `docs/QA_NOTES.md`.

## Evidence

- Selenium test screenshots: `evidence/selenium/`
- Mocha execution summary: `evidence/selenium/mocha-summary.png`
- Postman Runner result: `evidence/postman/postmanResults.png`

Screenshots document the actual execution, including the failed acceptance criterion. A pending test is not represented as passing.

## Submission

1. Confirm the repository contains the source code, `package.json`, `package-lock.json`, Postman collection, documentation and evidence.
2. Create a **private** GitHub repository.
3. From the project root, run:

   ```bash
   git init
   git add .
   git commit -m "Implement RIA QA coding challenge"
   git branch -M main
   git remote add origin YOUR_PRIVATE_GITHUB_REPO_URL
   git push -u origin main
   ```

4. Replace `YOUR_PRIVATE_GITHUB_REPO_URL` with the private repository URL.
5. Invite `bhan@riamoneytransfer.com` and `r.nair@epay.de` as repository collaborators (using the corresponding GitHub accounts, if required).
6. Verify that the repository is private and that both Selenium and Postman result screenshots are present.

Do not commit credentials, access tokens, personal information or `node_modules/`.
