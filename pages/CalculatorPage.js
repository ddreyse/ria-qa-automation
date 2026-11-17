const { By } = require('selenium-webdriver');
const assert = require('node:assert/strict');

const {
  visibleOrNull,
  waitForVisible,
  replaceText,
  dismissCookies,
  parseMoney
} = require('../src/support/dom');

const ORIGIN = process.env.RIA_BASE_URL ||
  'https://www.riamoneytransfer.com/en-cl/';

class CalculatorPage {

  constructor(driver) {
    this.driver = driver;
  }

  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  async open() {
    await this.driver.get(ORIGIN);
    await dismissCookies(this.driver);

    await this.amountInput();
  }

  // =========================================================
  // CALCULATOR ELEMENTS
  // =========================================================

  async amountInput() {
    return waitForVisible(this.driver, [
      By.id('amount-from'),
      By.css('[data-testid="send-amount"]'),
      By.css('input[name="sendAmount"]'),
      By.css('input[aria-label="You send"]'),
      By.css('input[aria-label="Amount"]'),
      By.xpath(
        "(//*[normalize-space()='You send' or " +
        "normalize-space()='Envías' or " +
        "normalize-space()='Amount']/following::input[not(@type='hidden')])[1]"
      )
    ], 'sending amount input');
  }

  async receivedInput() {
    return waitForVisible(this.driver, [
      By.css('[data-testid="receive-amount"]'),
      By.css('input[name="receiveAmount"]'),
      By.css('input[aria-label="They receive"]'),
      By.xpath(
        "(//*[normalize-space()='They receive' or " +
        "normalize-space()='Reciben' or " +
        "normalize-space()='Converted To']/following::input[not(@type='hidden')])[1]"
      )
    ], 'recipient amount input');
  }

  // =========================================================
  // AMOUNT OPERATIONS
  // =========================================================

  async enterAmount(amount) {
    const input = await this.amountInput();
    await replaceText(input, amount);
  }

  async updateAmountAndWaitForQuote(amount) {

    const previousReceived = await this.receivedAmount();

    await this.enterAmount(amount);

    await this.driver.wait(
      async () => {
        const entered = await this.enteredAmount();
        return entered === amount;
      },
      10000,
      `Send amount was not updated to ${amount}`
    );

    const updatedReceived =
      await this.waitForReceivedAmountToChange(previousReceived);

    console.log(
      `Quote updated: ${previousReceived} -> ${updatedReceived} HTG`
    );

    return updatedReceived;
  }

  async enteredAmount() {
    const input = await this.amountInput();

    return parseMoney(
      await input.getAttribute('value')
    );
  }

  async receivedAmount() {
    const input = await this.receivedInput();

    return parseMoney(
      await input.getAttribute('value')
    );
  }

  async waitForPositiveReceivedAmount() {
    return this.driver.wait(async () => {
      const received = await this.receivedAmount();

      return Number.isFinite(received) && received > 0
        ? received
        : false;

    }, 15000, 'The calculator did not return a positive converted amount.');
  }

  async waitForReceivedAmountToChange(previous) {
    return this.driver.wait(async () => {
      const received = await this.receivedAmount();

      return Number.isFinite(received) &&
        received > 0 &&
        Math.abs(received - previous) > 0.009
        ? received
        : false;

    }, 15000, 'The converted amount did not change after updating the send amount.');
  }

  // =========================================================
  // AMOUNT VALIDATION
  // =========================================================

  async assertInvalidAmountError() {
    await waitForVisible(this.driver, [
      By.xpath(
        "//*[contains(normalize-space(text()), 'Please enter a valid amount')]"
      )
    ], 'exact validation error "Please enter a valid amount"');
  }

  // =========================================================
  // DESTINATION COUNTRY DROPDOWN
  // =========================================================

  destinationTriggerLocator() {
    return By.css(
      'button[aria-label="Select Destination"], ' +
      'button[aria-label^="Selecciona Destino"]'
    );
  }

  async openDestinationDropdown() {
    const trigger = await waitForVisible(this.driver, [
      this.destinationTriggerLocator()
    ], 'destination country dropdown');

    await trigger.click();

    await this.driver.wait(
      async () => {
        return (await trigger.getAttribute('aria-expanded')) === 'true';
      },
      10000,
      'Destination dropdown did not open'
    );
  }

  // =========================================================
  // SELECT HAITI AND HTG CURRENCY
  // =========================================================

  async selectHaiti() {

    // Open destination dropdown
    await this.openDestinationDropdown();

    // Search for Haiti
    const search = await visibleOrNull(this.driver, [
      By.css('input[placeholder*="Search" i]'),
      By.css('input[placeholder*="country" i]'),
      By.css('input[placeholder*="Buscar" i]'),
      By.css('input[aria-label*="Search" i]')
    ]);

    if (search) {
      await search.click();
      await search.sendKeys('Hait');
    }

    // Select Haiti
    const countryOption = await waitForVisible(this.driver, [
      By.xpath(
        "//*[@role='option' and " +
        "(contains(normalize-space(.), 'Haiti') or " +
        "contains(normalize-space(.), 'Haití'))]"
      ),
      By.xpath(
        "//button[normalize-space()='Haiti' or " +
        "normalize-space()='Haití' or " +
        ".//*[normalize-space()='Haiti' or normalize-space()='Haití']]"
      ),
      By.xpath(
        "//li[normalize-space()='Haiti' or " +
        "normalize-space()='Haití' or " +
        ".//*[normalize-space()='Haiti' or normalize-space()='Haití']]"
      )
    ], 'Haiti country option');

    await countryOption.click();

    // Select HTG currency
    const htgLocator = By.xpath(
      "//*[@role='dialog']//*[normalize-space(.)='HTG']" +
      "/ancestor::*[self::button or @role='option'][1]"
    );

    let currencyOption;

    await this.driver.wait(
      async () => {
        const elements = await this.driver.findElements(htgLocator);

        for (const element of elements) {
          try {
            const visible = await element.isDisplayed();
            const enabled = await element.isEnabled();
            const rect = await element.getRect();

            if (
              visible &&
              enabled &&
              rect.width > 0 &&
              rect.height > 0
            ) {
              currencyOption = element;
              return true;
            }
          } catch {
            // Element may have been replaced during rendering.
          }
        }

        return false;
      },
      10000,
      'HTG currency option is not ready for interaction'
    );

    console.log(
      'HTG option:',
      await currencyOption.getAttribute('outerHTML')
    );

    await currencyOption.click();

    // Verify destination currency selection
    await this.driver.wait(
      async () => {
        const trigger = await this.driver.findElement(
          this.destinationTriggerLocator()
        );

        const selectedCurrency = (await trigger.getText()).trim();
        const expanded = await trigger.getAttribute('aria-expanded');

        return selectedCurrency === 'HTG' && expanded === 'false';
      },
      10000,
      'HTG was not selected or destination dropdown remains open'
    );
  }

  // =========================================================
  // EXCHANGE RATE
  // =========================================================

  async visibleExchangeRate() {

    const bodyText = await this.driver
      .findElement(By.tagName('body'))
      .getText();

    const quoteIndex = bodyText.search(
      /Quote details|Your first transfer|You send|Detalles de la cotización/i
    );

    const quoteText = quoteIndex >= 0
      ? bodyText.slice(Math.max(0, quoteIndex - 100), quoteIndex + 600)
      : bodyText.slice(0, 700);

    console.log('\n========== RIA EXCHANGE RATE DEBUG ==========');
    console.log(quoteText);
    console.log('=============================================\n');

    const regex = /1\s*CLP\s*=\s*([\d.,]+)(?:\s+([\d.,]+))?\s*HTG/gi;

    const matches = [...bodyText.matchAll(regex)];

    if (!matches.length) {
      return null;
    }

    const last = matches[matches.length - 1];

    const candidates = [last[1], last[2]].filter(Boolean);

    const raw = candidates.sort((a, b) => {
      const decimals = (value) =>
        (value.split(/[.,]/).at(-1) || '').length;

      return decimals(b) - decimals(a);
    })[0];

    const rate = Number(raw.replace(',', '.'));
    const fraction = raw.split(/[.,]/)[1] || '';

    return Number.isFinite(rate) && rate > 0
      ? {
        rate,
        decimals: fraction.length
      }
      : null;
  }

  // =========================================================
  // CONVERSION VALIDATION
  // =========================================================

  async validateQuotedConversion(sendAmount, receivedAmount) {

    const quote = await this.visibleExchangeRate();

    assert.ok(
      quote,
      'No CLP→HTG exchange rate is visible. Cannot validate mathematical conversion without a reliable oracle.'
    );

    const expected = sendAmount * quote.rate;

    const roundingTolerance =
      sendAmount * (0.5 * 10 ** (-quote.decimals)) + 0.02;

    assert.ok(
      Math.abs(receivedAmount - expected) <= roundingTolerance,

      `Converted amount mismatch: expected ~${expected.toFixed(2)} HTG ` +
      `using rate ${quote.rate}, received ${receivedAmount} HTG ` +
      `(display rounding tolerance ${roundingTolerance.toFixed(2)} HTG).`
    );
  }

  // =========================================================
  // GET STARTED NAVIGATION
  // =========================================================

  async clickGetStarted() {

    const link = await waitForVisible(this.driver, [
      By.xpath(
        "//a[normalize-space()='Get Started' or " +
        "normalize-space()='Get started' or " +
        "normalize-space()='Start your transfer' or " +
        "normalize-space()='Enviar Dinero']"
      ),
      By.xpath(
        "//button[normalize-space()='Get Started' or " +
        "normalize-space()='Start your transfer' or " +
        "normalize-space()='Enviar Dinero']"
      )
    ], 'Get Started / Start your transfer link');

    const originalHandles = await this.driver.getAllWindowHandles();

    await link.click();

    await this.driver.wait(async () => {
      const handles = await this.driver.getAllWindowHandles();
      const url = await this.driver.getCurrentUrl();

      return handles.length > originalHandles.length ||
        url.includes('secure.riamoneytransfer.com');

    }, 20000, 'Get Started did not open the secure Ria site.');

    const handles = await this.driver.getAllWindowHandles();

    if (handles.length > originalHandles.length) {
      await this.driver.switchTo().window(
        handles[handles.length - 1]
      );
    }
  }
}

module.exports = CalculatorPage;