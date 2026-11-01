const puppeteer = require('puppeteer');

async function testPage() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:3000/?salidas=1&work=DD');
  await new Promise(r => setTimeout(r, 3000));
  const el = await page.$('.overflow-y-auto');
  console.log('Found .overflow-y-auto:', !!el);
  await browser.close();
}

testPage().catch(console.error);
