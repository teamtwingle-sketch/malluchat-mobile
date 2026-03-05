import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  
  await page1.goto('http://localhost:5173');
  
  await new Promise(r => setTimeout(r, 1000));
  
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
  
  await pb1.focus();
  await pb1.type('ping');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));

  const myIdStr = await page1.evaluate(() => {
     return [...document.querySelectorAll('div')].find(d => d.innerText && d.innerText.includes('Room is Ready')) || "NOT IN PRIVATE";
  });
  console.log("MY ID STRING: ", myIdStr);
  
  await browser.close();
})();
