const puppeteer = require('puppeteer');

async function testScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  // 1. Mobile viewport
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://127.0.0.1:3000/?checker=1', { waitUntil: 'networkidle0' });

  // Click card 1
  const card1Mobile = await mobilePage.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('#1') || b.textContent.includes('Carta 1'));
  });
  await card1Mobile.click();
  await mobilePage.waitForSelector('[data-flow-container]');

  // Advance quickly through card blocks to video 2
  for (let i = 0; i <= 11; i++) {
    await new Promise(r => setTimeout(r, 1300));
    await mobilePage.click('[data-flow-container]');
    await new Promise(r => setTimeout(r, 300));
  }

  // Wait for video 2 to mount
  await mobilePage.waitForSelector('video');
  await new Promise(r => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: 'public/audit_mobile_video2_current.png' });
  console.log('Captured public/audit_mobile_video2_current.png');

  // Finish video 2 to get to three exits
  await mobilePage.evaluate(() => {
    const v = document.querySelector('video');
    if (v) {
      v.dispatchEvent(new Event('ended'));
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: 'public/audit_mobile_three_exits_current.png', fullPage: true });
  console.log('Captured public/audit_mobile_three_exits_current.png');

  // Desktop three exits
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto('http://127.0.0.1:3000/?checker=1', { waitUntil: 'networkidle0' });
  const card1Desk = await desktopPage.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('#1') || b.textContent.includes('Carta 1'));
  });
  await card1Desk.click();
  await desktopPage.waitForSelector('[data-flow-container]');

  for (let i = 0; i <= 11; i++) {
    await new Promise(r => setTimeout(r, 1300));
    await desktopPage.click('[data-flow-container]');
    await new Promise(r => setTimeout(r, 300));
  }

  await desktopPage.waitForSelector('video');
  await desktopPage.evaluate(() => {
    const v = document.querySelector('video');
    if (v) {
      v.dispatchEvent(new Event('ended'));
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await desktopPage.screenshot({ path: 'public/audit_desktop_three_exits_current.png' });
  console.log('Captured public/audit_desktop_three_exits_current.png');

  await browser.close();
}

testScreenshots().catch(console.error);
