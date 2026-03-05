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
  
  const pb1 = await page1.$('input[placeholder="Send to public..."]');
  await pb1.type(' ');
  await new Promise(r => setTimeout(r, 500));
  await page1.type('input[placeholder="Enter display name..."]', 'User1');
  await page1.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'Start Chatting').click());
  
  await new Promise(r => setTimeout(r, 1000));
  
  const pb2 = await page2.$('input[placeholder="Send to public..."]');
  await pb2.type(' ');
  await new Promise(r => setTimeout(r, 500));
  await page2.type('input[placeholder="Enter display name..."]', 'User2');
  await page2.evaluate(() => [...document.querySelectorAll('button')].find(b => b.innerText === 'Start Chatting').click());
  
  await new Promise(r => setTimeout(r, 1000));
  
  await pb1.focus();
  await pb1.type('ping');
  await page1.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("USER 2 CLICKS USER1 TO START CHAT...");
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
  
  console.log("USER 1 ACCEPTS...");
  await page1.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText === 'Accept');
      if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log("USER 2 SENDS PRIVATE MSG...");
  await page2.evaluate(() => {
      const input = document.querySelector('input[placeholder="Type a secure message..."]');
      if (input) {
         input.value = "secret hello";
         input.dispatchEvent(new Event('input', {bubbles:true}));
      }
      const btns = [...document.querySelectorAll('button')];
      const sendBtn = btns[btns.length-1]; // last button is send usually
  });
  await page2.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));

  const p1Html = await page1.content();
  console.log("USER 1 GOT SECRET MESSAGE?", p1Html.includes('secret hello'));
  
  await browser.close();
})();
