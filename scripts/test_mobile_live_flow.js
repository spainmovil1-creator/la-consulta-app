const puppeteer = require('puppeteer');

async function testMobileFlow() {
  console.log('--- INICIANDO TEST DEL FLUJO MÓVIL EN TIEMPO REAL ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Escuchar logs de consola
  page.on('console', msg => {
    if (msg.text().includes('Autoplay') || msg.text().includes('Voz')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:3000/?salidas=1&work=DD', { waitUntil: 'networkidle2' });

  // Registrar estado en T = 1s (Voz 1), T = 4.5s (Voz 2), T = 8.5s (Voz 3 iniciando), T = 12s (Final)
  const checkpoints = [
    { time: 1500, label: 'voz1_salida1' },
    { time: 5000, label: 'voz2_salida2' },
    { time: 8800, label: 'voz3_salida3_inicio' },
    { time: 11000, label: 'voz3_salida3_durante' },
    { time: 13500, label: 'secuencia_final' }
  ];

  let elapsed = 0;
  for (const cp of checkpoints) {
    const waitTime = cp.time - elapsed;
    if (waitTime > 0) {
      await new Promise(r => setTimeout(r, waitTime));
      elapsed = cp.time;
    }

    const state = await page.evaluate(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const s3 = document.querySelectorAll('.group')[2];
      const img3 = s3 ? s3.querySelector('img') : null;
      const r3 = s3 ? s3.getBoundingClientRect() : null;

      return {
        scrollY,
        salida3: s3 ? {
          display: window.getComputedStyle(s3).display,
          opacity: window.getComputedStyle(s3).opacity,
          top: r3 ? r3.top : null,
          bottom: r3 ? r3.bottom : null,
          inViewport: r3 ? (r3.top < window.innerHeight && r3.bottom > 0) : false,
          imgComplete: img3 ? img3.complete : null,
          imgNaturalWidth: img3 ? img3.naturalWidth : null,
        } : null
      };
    });

    console.log(`[T = ${(cp.time / 1000).toFixed(1)}s] (${cp.label}):`, JSON.stringify(state));
    await page.screenshot({ path: `public/mobile_checkpoint_${cp.label}.png` });
  }

  await browser.close();
  console.log('--- TEST COMPLETADO CON ÉXITO ---');
}

testMobileFlow().catch(console.error);
