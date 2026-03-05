import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  
  page1.on('console', msg => console.log('P1:', msg.text()));
  page2.on('console', msg => console.log('P2:', msg.text()));

  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Login P1
  await page1.type('input[placeholder="Send to public..."]', ' ');
  await new Promise(r => setTimeout(r, 500));
  await page1.type('input[placeholder="Enter display name..."]', 'User1');
  const btns1 = await page1.$$('button');
  for (let b of btns1) {
    const text = await page1.evaluate(el => el.innerText, b);
    if (text === 'Start Chatting') await b.click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Login P2
  await page2.type('input[placeholder="Send to public..."]', ' ');
  await new Promise(r => setTimeout(r, 500));
  await page2.type('input[placeholder="Enter display name..."]', 'User2');
  const btns2 = await page2.$$('button');
  for (let b of btns2) {
    const text = await page2.evaluate(el => el.innerText, b);
    if (text === 'Start Chatting') await b.click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Send public message
  await page1.type('input[placeholder="Send to public..."]', 'ping');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // P2 clicks User1
  await page2.evaluate(() => {
      window.confirm = () => true;
      const spans = document.querySelectorAll('.message-time span');
      for (let s of spans) {
          if (s.innerText.includes('User1')) {
              s.click();
              break;
          }
      }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // P1 accepts
  const btnsP1 = await page1.$$('button');
  for (let b of btnsP1) {
    const text = await page1.evaluate(el => el.innerText, b);
    if (text === 'Accept') await b.click();
  }

  await new Promise(r => setTimeout(r, 2000));

  // P2 sends MSG
  await page2.type('input[placeholder="Type a secure message..."]', 'secret');
  await page2.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));

  const p1Html = await page1.content();
  console.log("USER 1 GOT SECRET MESSAGE?", p1Html.includes('secret'));
  
  await browser.close();
})();
