import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
  
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    // try to get all text on screen
    console.log("BODY TEXT SIZE:", document.body.innerText.length);
  });
  
  await browser.close();
})();
