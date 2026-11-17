# Test strategy, risks and observations

## Original acceptance criteria

- Send **25,000 CLP to Haiti (HTG)** and validate the converted amount after calculation.
- Enter alphabetic characters in **Amount** and expect the **exact** error `Please enter a valid amount`.
- Confirm the **Send to** dropdown supports country selection.
- Confirm a conversion is recalculated when the sending amount is updated.
- Click **Get Started** and navigate to `https://secure.riamoneytransfer.com/`.
- On the secure screen verify **Register**, **Phone or email**, and **Password**.
- After clicking **Register**, verify country selection.
- GET `/posts/`: 200, all titles/bodies have content, no `zombie`.
- POST `/post`: 200/201, toppings exactly `bacon`, `cheese`, `mushroom`, not `chicken`.

## Potential specification / production differences to verify manually

1. Public RIA homepage can localize or redirect based on browser settings. Explicit Chile locale is used to fix the sending currency to CLP.
2. Current public UI copy may use `You send` / `They receive` / `Start your transfer` in place of `Amount` / `Send to` / `Get Started`. These **are observations about terminology**, not confirmed functional defects.
3. The amount input may prevent letters entirely instead of displaying the exact expected error. The test deliberately asserts the **specified message** and should fail if it is absent; investigate and document the mismatch rather than weakening the assertion.
4. RIA quotes and fees fluctuate. A fixed expected HTG amount is not a suitable assertion. The UI conversion test uses the displayed quote rate and checks positive, numeric output. Do not substitute a general mid-market conversion rate for the customer quote.
5. A private, authentication-related site may present cookie banners, temporary network problems, rate limiting or bot challenges. These are external/environment limitations to document, not reasons to automatically mark the test passed.
6. The secure app is JavaScript-dependent; static page fetches cannot establish which inputs and country-selection controls are visible in a real browser.
7. Cross-check dropdown and amount selectors against the browser DOM during first execution. Page Objects intentionally isolate any required locator adjustments.

## Test Execution Results

**Execution date:** November 16, 2026  
**Environment:** Windows 11, Chrome, Selenium WebDriver, Mocha, Postman

| Test ID | Result | Observations |
|---|---|---|
| CALC-01 | FAIL | Alphabetic characters are rejected, but the required validation message is not displayed. |
| CALC-01B | PASS | Amount input rejects alphabetic characters. |
| CALC-02 | PASS | Haiti and HTG currency successfully selected. |
| CALC-03 | PASS | 25,000 CLP converted to 3,276.65 HTG using the displayed promotional rate of 0.131066. |
| CALC-04 | PASS | Converted amount updates when the sending amount changes. |
| REG-01 | PASS | Secure navigation and required login elements validated. |
| REG-02 | BLOCKED (FAIL) | RIA explicitly prevents account registration from Chile. The expected country selection page cannot be reached. |
| SMOKE | PASS | RIA homepage loads successfully. |
| API-GET | PASS | All four Postman assertions passed. |
| API-POST | PASS | All four Postman assertions passed. |

### Known Limitations

**CALC-01:** The application rejects alphabetic characters without displaying the exact validation message required by the acceptance criteria. The original assertion remains unchanged.

**REG-02:** Registration is blocked by RIA based on the user's geographic location. The application displays: "Según tu ubicación actual, no puedes registrar una cuenta en Chile". The test detects this restriction and reports a descriptive failure. This is an environment limitation, not a confirmed application defect.

### Test Evidence

- Selenium screenshots: `evidence/selenium/`
- Postman results: `evidence/postman/postmanResults.png`

All passing results reflect observed executions. Failed and blocked scenarios are documented without altering their expected behavior.
