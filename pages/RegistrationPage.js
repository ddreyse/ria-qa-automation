const { By } = require('selenium-webdriver');
const { waitForVisible } = require('../src/support/dom');

class RegistrationPage {
  constructor(driver) {
    this.driver = driver;
  }

  async registerButton() {
    return waitForVisible(this.driver, [
      By.css('a[href="/registration"]'),
      By.css('a[href$="/registration"]'),
      By.xpath(
        "//a[normalize-space()='Register' or " +
        "normalize-space()='Regístrate' or " +
        "normalize-space()='Registrarse' or " +
        "normalize-space()='Sign up']"
      )
    ], 'Register button');
  }

  async phoneOrEmailInput() {
    return waitForVisible(this.driver, [
      By.css('input[autocomplete="username"]'),
      By.css('input[name="username"]'),
      By.css('input[type="email"]'),
      By.css('input[type="tel"]'),
      By.css('input[type="text"]')
    ], 'Phone or email input');
  }

  async passwordInput() {
    return waitForVisible(this.driver, [
      By.css('input[type="password"]'),
      By.css('input[autocomplete="current-password"]')
    ], 'Password input');
  }

  async clickRegister() {
    const button = await this.registerButton();
    await button.click();

    await this.driver.wait(
      async () => {
        const url = await this.driver.getCurrentUrl();
        return new URL(url).pathname.startsWith('/registration');
      },
      15000,
      'Registration navigation failed'
    );
  }

  async waitForCountrySelection() {
    return waitForVisible(this.driver, [
      By.css('select[name*="country" i]'),
      By.css('select[aria-label*="country" i]'),
      By.css('[role="combobox"][aria-label*="country" i]'),
      By.css('[role="combobox"][aria-label*="país" i]'),
      By.xpath(
        "//*[self::h1 or self::h2 or self::h3 or " +
        "self::label or self::p]" +
        "[contains(translate(normalize-space(.), " +
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', " +
        "'abcdefghijklmnopqrstuvwxyz'), 'country') or " +
        "contains(normalize-space(.), 'país') or " +
        "contains(normalize-space(.), 'País') or " +
        "contains(normalize-space(.), 'pais')]"
      )
    ], 'country selection page', 15000);
  }
}

module.exports = RegistrationPage;