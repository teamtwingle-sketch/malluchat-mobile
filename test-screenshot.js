import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.error(`ERROR: ${error.message}`));
  
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    document.querySelector('input').focus();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.type('input[placeholder="Enter display name..."]', 'User1');
  await page.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
       if (b.innerText === 'Start Chatting') b.click();
     });
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'before_typing.png' });
  
  const publicInput = await page.$('input[placeholder="Send to public..."]');
  if (publicInput) {
      await publicInput.type('Hello from script');
      await page.keyboard.press('Enter');
  } else {
      console.log("Could not find public input!");
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'after_typing.png' });

  const messages = await page.$$eval('.message-bubble', bubbles => bubbles.map(b => b.textContent));
  console.log("Messages on screen:", messages);
  
  await browser.close();
})();
