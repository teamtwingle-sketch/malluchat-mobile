import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  
  page1.on('console', msg => console.log('P1:', msg.text()));

  await page1.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 1500));
  
  await page1.type('input[placeholder="Send to public..."]', ' ');
  await new Promise(r => setTimeout(r, 500));
  await page1.type('input[placeholder="Enter display name..."]', 'UserA');
  await page1.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'Start Chatting').click());
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page1.type('input[placeholder="Send to public..."]', 'hello world 123');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const myId = await page1.evaluate(() => {
     const span = document.querySelector('.message-time span');
     return span ? span.innerText : 'not found';
  });
  console.log("Found:", myId);
  
  await browser.close();
})();
