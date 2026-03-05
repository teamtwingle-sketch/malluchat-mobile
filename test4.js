import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();

  page1.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page1.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));

  await page1.goto('http://localhost:5173');

  // Wait for React to load
  await new Promise(r => setTimeout(r, 2000));
  
  await page1.type('input[placeholder="Send to public..."]', 'Hello world');
  await page1.keyboard.press('Enter');

  await new Promise(r => setTimeout(r, 1000));
  
  await page1.type('input[placeholder="Enter display name..."]', 'TestUser');
  await page1.click('button:has-text("Start Chatting")');

  await new Promise(r => setTimeout(r, 2000));

  await page1.keyboard.press('Enter');

  await new Promise(r => setTimeout(r, 2000));

  const messages = await page1.$$eval('.message-bubble', bubbles => bubbles.map(b => b.textContent));
  console.log("MESSAGES ON SCREEN: ", messages);

  await browser.close();
})();
