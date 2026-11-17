const assert = require('node:assert/strict');
const { Key } = require('selenium-webdriver');
const { buildDriver, saveEvidence } = require('../src/support/driver');
const CalculatorPage = require('../pages/CalculatorPage');

describe('RIA calculator | CLP to HTG', function () {
  this.timeout(60000);
  let driver, calculator;

  beforeEach(async function () {
    driver = await buildDriver();
    calculator = new CalculatorPage(driver);
    await calculator.open();
  });

  afterEach(async function () {
    try { await saveEvidence(driver, this.currentTest); }
    catch (error) { console.warn('Screenshot unavailable:', error.message); }
    finally { if (driver) await driver.quit(); }
  });

  it('CALC-01 | shows exact validation error for alphabetic send amount', async function () {
    await calculator.enterAmount('abc');

    const amountInput = await calculator.amountInput();
    await amountInput.sendKeys(Key.TAB);

    await calculator.assertInvalidAmountError();
  });
  
  it('CALC-01B | rejects alphabetic characters in amount field', async function () {
  await calculator.enterAmount('abc');

  const amountInput = await calculator.amountInput();
  const value = await amountInput.getAttribute('value');

  assert.equal(
    value,
    '',
    'Amount field should reject alphabetic characters'
  );
});
  it('CALC-02 | destination dropdown allows selecting Haiti (HTG)', async function () {
    await calculator.selectHaiti();
  });

  it('CALC-03 | converts 25000 CLP to HTG using displayed quote rate', async function () {

    // STEP 1: Capture initial quote
    const initialQuote = await calculator.receivedAmount();

    console.log(`Initial default quote: ${initialQuote}`);

    // STEP 2: Select Haiti and HTG
    await calculator.selectHaiti();

    // STEP 3: Enter 25,000 CLP and wait for quote update
    const received = await calculator.updateAmountAndWaitForQuote(25000);

    // STEP 4: Verify the entered amount
    const entered = await calculator.enteredAmount();

    assert.equal(
      entered,
      25000,
      `Expected 25000 CLP, received ${entered}`
    );

    // STEP 5: Verify destination currency
    const destinationCurrency = await driver.executeScript(() => {
      const button = document.querySelector(
        'button[aria-label="Select Destination"], ' +
        'button[aria-label^="Selecciona Destino"]'
      );

      return button?.innerText.trim();
    });

    assert.equal(
      destinationCurrency,
      'HTG',
      'Destination currency must be HTG'
    );

    // STEP 6: Read the raw received amount
    const receivedInput = await calculator.receivedInput();

    const rawReceived = await receivedInput.getAttribute('value');

    console.log('========== CONVERSION DEBUG ==========');
    console.log(`Initial quote: ${initialQuote}`);
    console.log(`Sending: ${entered} CLP`);
    console.log(`Receiving (raw): ${rawReceived}`);
    console.log(`Receiving (parsed): ${received}`);
    console.log(`Destination currency: ${destinationCurrency}`);
    console.log('======================================');

    // STEP 7: Verify a positive converted amount
    assert.ok(
      Number.isFinite(received) && received > 0,
      'Received amount must be positive'
    );

    // STEP 8: Validate mathematical conversion
    await calculator.validateQuotedConversion(25000, received);

  });

  it('CALC-04 | updates converted amount when send amount changes', async function () {

    // STEP 1: Select Haiti and HTG currency
    await calculator.selectHaiti();

    // STEP 2: First conversion - 25,000 CLP
    const initial = await calculator.updateAmountAndWaitForQuote(25000);

    // STEP 3: Second conversion - 35,000 CLP
    const updated = await calculator.updateAmountAndWaitForQuote(35000);

    // STEP 4: Verify the converted amount increased
    assert.ok(
      updated > initial,
      `Expected new quote ${updated} to exceed initial quote ${initial}`
    );

    // STEP 5: Verify the sending amount
    assert.equal(
      await calculator.enteredAmount(),
      35000
    );

    // STEP 6: Log results
    console.log(`Initial quote: ${initial} HTG`);
    console.log(`Updated quote: ${updated} HTG`);

  });
});
