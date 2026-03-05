import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  
  await page1.goto('http://localhost:5173');
  await page2.goto('http://localhost:5173');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Login 1
  await page1.evaluate(() => { document.querySelector('input').focus(); });
  await page1.type('input[placeholder="Enter display name..."]', 'User1');
  await page1.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
       if (b.innerText === 'Start Chatting') b.click();
     });
  });
  
  // Login 2
  await page2.evaluate(() => { document.querySelector('input').focus(); });
  await page2.type('input[placeholder="Enter display name..."]', 'User2');
  await page2.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
       if (b.innerText === 'Start Chatting') b.click();
     });
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // User 1 sends message
  const publicInput = await page1.$('input[placeholder="Send to public..."]');
  await publicInput.type('ping');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // User 2 tries to click the username of User 1 to open private chat
  await page2.evaluate(() => {
      const messages = document.querySelectorAll('.message-time span');
      for (let m of messages) {
          if (m.innerText.includes('User1')) {
              // Override confirm to always accept
              window.confirm = () => true;
              m.click();
              break;
          }
      }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page1.screenshot({ path: 'user1_toast_check.png' });
  await page2.screenshot({ path: 'user2_status_check.png' });

  // Get User 1 HTML
  const p1Html = await page1.content();
  console.log("USER 1 HAS TOAST?", p1Html.includes('wants to connect securely'));
  
  await browser.close();
})();
