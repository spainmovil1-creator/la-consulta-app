const puppeteer = require('puppeteer');

async function testScroll() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/?salidas=1&work=DD');

  await new Promise(r => setTimeout(r, 4000)); // wait for renders

  // Scroll to salida 3
  const result = await page.evaluate(() => {
    const s3 = document.querySelectorAll('.group')[2];
    if (s3) {
      s3.scrollIntoView({ behavior: 'instant', block: 'end' });
      const r = s3.getBoundingClientRect();
      return {
        top: r.top,
        bottom: r.bottom,
        inViewport: r.top >= 0 && r.bottom <= window.innerHeight
      };
    }
    return null;
  });

  console.log('Salida 3 after scrollIntoView:', result);
  await page.screenshot({ path: 'public/test_scroll_s3.png' });
  await browser.close();
}

testScroll();
