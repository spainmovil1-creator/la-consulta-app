const puppeteer = require('puppeteer');

async function testAudioAutoplay() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost:3000/?salidas=1&work=DD');
  
  for (let i = 0; i <= 15; i++) {
    const status = await page.evaluate(() => {
      const groups = Array.from(document.querySelectorAll('.group'));
      return groups.map((g, idx) => {
        const style = window.getComputedStyle(g);
        const img = g.querySelector('img');
        return {
          salida: idx + 1,
          display: style.display,
          opacity: style.opacity,
          visibility: style.visibility,
          img: img ? img.src.split('/').pop() : null
        };
      });
    });
    console.log('T = ' + i + 's:', JSON.stringify(status));
    if (i === 1) {
      await page.screenshot({ path: 'public/auditoria_mobile_exacta_salida1.png' });
      console.log('Saved public/auditoria_mobile_exacta_salida1.png at T=1s');
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  await page.screenshot({ path: 'public/auditoria_mobile_exacta_final.png' });
  console.log('Saved public/auditoria_mobile_exacta_final.png at T=15s');

  await browser.close();
}

testAudioAutoplay().catch(console.error);
