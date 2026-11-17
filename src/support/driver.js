const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('node:fs/promises');
const path = require('node:path');

async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments('--window-size=1440,1000');
  if (process.env.HEADLESS === '1') {
    options.addArguments('--headless=new', '--disable-gpu');
  }
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  await driver.manage().setTimeouts({ pageLoad: 30000, implicit: 0 });
  return driver;
}

async function saveEvidence(driver, test) {
  if (!driver || !test) return;
  const directory = path.join(__dirname, '..', '..', 'evidence', 'selenium');
  await fs.mkdir(directory, { recursive: true });
  const name = test.fullTitle()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
  const status = test.state === 'passed' ? 'PASS' : 'FAIL';
  const filename = `${name}-${status}.png`;
  await fs.writeFile(path.join(directory, filename), await driver.takeScreenshot(), 'base64');
}

module.exports = { buildDriver, saveEvidence };
