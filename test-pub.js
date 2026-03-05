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
  
  // Login 1
  const pb1 = await page1.$('input[placeholder="Send to public..."]');
  await pb1.type(' ');
  await new Promise(r => setTimeout(r, 500));
  
  await page1.type('input[placeholder="Enter display name..."]', 'User1');
  await page1.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
       if (b.innerText === 'Start Chatting') b.click();
     });
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Login 2
  const pb2 = await page2.$('input[placeholder="Send to public..."]');
  await pb2.type(' ');
  await new Promise(r => setTimeout(r, 500));
  
  await page2.type('input[placeholder="Enter display name..."]', 'User2');
  await page2.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
       if (b.innerText === 'Start Chatting') b.click();
     });
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // User 1 sends PUBLIC message
  await pb1.focus();
  await pb1.evaluate(e => e.value = ''); // clear it
  await pb1.type('hello world from user 1!');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const p1Html = await page1.content();
  const p2Html = await page2.content();
  console.log("P2 RECVD PUBLIC?", p2Html.includes('hello world from user 1!'));
  
  await browser.close();
})();
