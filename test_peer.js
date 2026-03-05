import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();

  page1.on('console', msg => console.log('PAGE 1 LOG:', msg.text()));
  page2.on('console', msg => console.log('PAGE 2 LOG:', msg.text()));

  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');

  // Wait for React to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Try sending a message from page1
  await page1.type('input[placeholder="Enter display name..."]', 'User1');
  await page1.click('button:has-text("Start Chatting")');
  
  await page2.type('input[placeholder="Enter display name..."]', 'User2');
  await page2.click('button:has-text("Start Chatting")');

  await new Promise(r => setTimeout(r, 1000));

  await page1.type('.public-chat-input .input-field', 'Hello from User1');
  await page1.keyboard.press('Enter');

  await new Promise(r => setTimeout(r, 1000));

  // click on user1's message in page2
  const messages = await page2.$$('.message-time span');
  for (let span of messages) {
     const text = await page2.evaluate(el => el.textContent, span);
     if (text.includes('User1')) {
         await span.click();
         break;
     }
  }

  await new Promise(r => setTimeout(r, 1000));
  console.log("Done test");
  await browser.close();
})();
