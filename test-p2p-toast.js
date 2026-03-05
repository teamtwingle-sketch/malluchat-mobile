import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  
  page1.on('console', msg => console.log('P1:', msg.text()));
  page2.on('console', msg => console.log('P2:', msg.text()));

  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');
  
  await new Promise(r => setTimeout(r, 1500));
  
  // Login P1
  await page1.type('input[placeholder="Send to public..."]', ' ');
  await new Promise(r => setTimeout(r, 500));
  await page1.type('input[placeholder="Enter display name..."]', 'UserA');
  await page1.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'Start Chatting').click());
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Login P2
  await page2.type('input[placeholder="Send to public..."]', ' ');
  await new Promise(r => setTimeout(r, 500));
  await page2.type('input[placeholder="Enter display name..."]', 'UserB');
  await page2.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'Start Chatting').click());
  
  await new Promise(r => setTimeout(r, 1000));
  
  // P1 sends public message
  console.log("P1 sending public chat...");
  await page1.type('input[placeholder="Send to public..."]', 'myidcheck');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if P2 sees the message and can click it
  console.log("P2 requests chat with P1...");
  await page2.evaluate(() => {
      window.confirm = () => true;
      const spans = document.querySelectorAll('.message-time span');
      for (let s of spans) {
          if (s.innerText.includes('UserA')) {
              s.click();
              break;
          }
      }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Does P1 see the toast?
  const p1Html = await page1.content();
  console.log("P1 SEES TOAST?", p1Html.includes('Chat Request'));
  
  await browser.close();
})();
