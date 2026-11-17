const { Builder } = require('selenium-webdriver');
const assert = require('node:assert/strict');

describe('RIA Money Transfer - Smoke Tests', function () {
    this.timeout(30000);

    let driver;

    before(async function () {
        driver = await new Builder()
            .forBrowser('chrome')
            .build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('Should navigate to RIA Money Transfer', async function () {
        await driver.get('https://www.riamoneytransfer.com/');

        const title = await driver.getTitle();

        console.log(`Page title: ${title}`);

        assert.ok(title.length > 0, 'Page title should not be empty');
    });
});