const puppeteer = require('puppeteer');

async function testScrollMovement() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/?salidas=1&work=DD');

  for (let s = 1; s <= 14; s++) {
    await new Promise(r => setTimeout(r, 1000));
    const data = await page.evaluate(() => {
      const c = document.querySelector('.overflow-y-auto');
      const s3 = document.querySelectorAll('.group')[2];
      const r3 = s3 ? s3.getBoundingClientRect() : null;
      return {
        scrollTop: c ? c.scrollTop : null,
        s3Top: r3 ? r3.top : null,
        s3Bottom: r3 ? r3.bottom : null,
        s3InViewport: r3 ? (r3.top < window.innerHeight && r3.bottom > 0) : false
      };
    });
    console.log(`Sec ${s}:`, JSON.stringify(data));
  }

  await page.screenshot({ path: 'public/mobile_smooth_scroll_final.png' });
  await browser.close();
}

testScrollMovement();
