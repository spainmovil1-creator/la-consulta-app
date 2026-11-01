const puppeteer = require('puppeteer');

async function captureExits() {
  console.log('Capturing real ThreeExitsScreen on desktop and mobile...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop 1440x900
  const pageDesk = await browser.newPage();
  await pageDesk.setViewport({ width: 1440, height: 900 });
  await pageDesk.goto('http://127.0.0.1:3000/?salidas', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await pageDesk.screenshot({ path: 'public/current_exits_desktop.png' });
  console.log('Saved public/current_exits_desktop.png');
  await pageDesk.close();

  // 2. Mobile 390x844
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await pageMobile.goto('http://127.0.0.1:3000/?salidas', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: 'public/current_exits_mobile.png' });
  console.log('Saved public/current_exits_mobile.png');
  await pageMobile.close();

  await browser.close();
}

captureExits().catch(console.error);
