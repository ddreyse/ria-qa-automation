const { By, Key } = require('selenium-webdriver');

async function visibleOrNull(driver, locators) {
  for (const locator of locators) {
    const elements = await driver.findElements(locator);
    for (const element of elements) {
      try {
        if (await element.isDisplayed()) return element;
      } catch (_) {
        // A reactive UI can replace an element between lookup and visibility check.
      }
    }
  }
  return null;
}

async function waitForVisible(driver, locators, description, timeout = 12000) {
  const result = await driver.wait(
    () => visibleOrNull(driver, locators),
    timeout,
    `Could not find visible ${description}. Inspect the live DOM and update its locators.`
  );
  return result;
}

async function replaceText(element, value) {
  await element.click();
  await element.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
  await element.sendKeys(String(value), Key.TAB);
}

async function dismissCookies(driver, preference = 'reject', timeout = 2500) {

  const labels = preference === 'accept'
    ? [
      'Allow all cookies',
      'Accept all cookies',
      'Aceptar cookies',
      'Aceptar todas las cookies'
    ]
    : [
      'Reject cookies',
      'Reject all cookies',
      'Reject all',
      'Rechazar cookies',
      'Rechazar todas',
      'Rechazar todas las cookies'
    ];

  const conditions = labels
    .map(label => `normalize-space(.)=${JSON.stringify(label)}`)
    .join(' or ');

  const locator = By.xpath(
    `//button[${conditions}] | //*[@role='button' and (${conditions})]`
  );

  let button;

  try {
    button = await driver.wait(
      () => visibleOrNull(driver, [locator]),
      timeout,
      'Cookie consent banner was not displayed'
    );
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return false;
    }

    throw error;
  }

  await button.click();

  // Verify the cookie banner has disappeared.
  await driver.wait(
    async () => {
      try {
        return !(await button.isDisplayed());
      } catch (error) {
        if (error.name === 'StaleElementReferenceError') {
          return true;
        }

        throw error;
      }
    },
    5000,
    'Cookie banner did not close after selecting a preference'
  );

  console.log(`Cookie consent handled: ${preference}`);

  return true;
}

// Parse formatted amounts in either English (3,400.50) or Spanish (3.400,50).
function parseMoney(raw) {
  const cleaned = String(raw ?? '').replace(/[^0-9,.-]/g, '');
  if (!cleaned) return NaN;
  const dot = cleaned.lastIndexOf('.');
  const comma = cleaned.lastIndexOf(',');
  if (dot !== -1 && comma !== -1) {
    const decimal = dot > comma ? '.' : ',';
    const grouping = decimal === '.' ? ',' : '.';
    return Number(cleaned.replaceAll(grouping, '').replace(decimal, '.'));
  }
  const separator = dot !== -1 ? '.' : (comma !== -1 ? ',' : null);
  if (!separator) return Number(cleaned);
  const fractionalLength = cleaned.length - cleaned.lastIndexOf(separator) - 1;
  if (fractionalLength === 3 && cleaned.split(separator).length === 2) {
    return Number(cleaned.replace(separator, ''));
  }
  return Number(cleaned.replace(separator, '.'));
}

module.exports = { visibleOrNull, waitForVisible, replaceText, dismissCookies, parseMoney };
