const assert = require('node:assert/strict');

const { buildDriver, saveEvidence } = require('../src/support/driver');
const { dismissCookies } = require('../src/support/dom');

const CalculatorPage = require('../pages/CalculatorPage');
const RegistrationPage = require('../pages/RegistrationPage');

describe('RIA registration navigation', function () {
  this.timeout(60000);

  let driver;
  let calculator;
  let registration;

  beforeEach(async function () {
    driver = await buildDriver();

    calculator = new CalculatorPage(driver);
    registration = new RegistrationPage(driver);

    await calculator.open();
    await calculator.clickGetStarted();

    await dismissCookies(driver, 'reject', 6000);
  });

  afterEach(async function () {
    try {
      await saveEvidence(driver, this.currentTest);
    } catch (error) {
      console.warn('Screenshot unavailable:', error.message);
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  });

  it('REG-01 | Get Started opens secure Ria with Register, Phone or email and Password', async function () {
    const url = new URL(await driver.getCurrentUrl());

    assert.equal(
      url.hostname,
      'secure.riamoneytransfer.com',
      `Unexpected destination: ${url}`
    );

    const register = await registration.registerButton();
    const username = await registration.phoneOrEmailInput();
    const password = await registration.passwordInput();

    assert.ok(await register.isDisplayed());
    assert.ok(await username.isDisplayed());
    assert.ok(await password.isDisplayed());
  });

  it('REG-02 | Register opens country selection', async function () {
    await registration.clickRegister();

    const isRegionBlocked = await driver.wait(
      async () => {
        const text = await driver.executeScript(
          'return document.body.innerText'
        );

        return /no puedes registrar\s+una cuenta en Chile/i.test(text);
      },
      5000
    ).catch(error => {
      if (error.name === 'TimeoutError') return false;
      throw error;
    });

    if (isRegionBlocked) {
      assert.fail(
        'REG-02 BLOCKED: Registration is unavailable from Chile.'
      );
    }

    const countrySelection = await registration.waitForCountrySelection();

    assert.ok(
      await countrySelection.isDisplayed(),
      'Country selection must be visible after registration navigation'
    );
  });
});