const puppeteer = require('puppeteer');

async function capture() {
  console.log('=== CAPTURANDO PANTALLAS REALES DE LA APLICACIÓN ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  // 1. DESKTOP CAPTURE (1440x900)
  {
    console.log('\n--- 1. DESKTOP (1440x900) ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://127.0.0.1:3000/?post-p15=true', { waitUntil: 'networkidle0', timeout: 20000 });
    console.log('Navegado a ?post-p15=true');

    // Esperar al contenedor
    await page.waitForSelector('[data-flow-container]', { timeout: 10000 });
    console.log('PostConsultationFlow montado.');

    // Saltar el vídeo 1 hacia la carta
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.currentTime = (v.duration || 15) - 0.1;
    });

    // Esperar a que la carta esté montada
    await page.waitForSelector('[data-card-sheet]', { timeout: 10000 });
    console.log('Carta desplegada. Leyendo bloques...');

    // Avanzar bloques de la carta hasta el final (hasta entrar en elenasillon2)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 450));
      const hasElena2 = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v && (v.currentSrc.includes('elenasillon2') || v.innerHTML.includes('elenasillon2'));
      });
      if (hasElena2) {
        console.log('Vídeo Elena 2 activo en desktop.');
        break;
      }
      await page.keyboard.press('Space');
    }

    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'public/real_desktop_elena2_video.png', fullPage: false });
    console.log('Captura guardada: public/real_desktop_elena2_video.png');

    // Avanzar el vídeo de Elena 2 hasta el final
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.currentTime = (v.duration || 10) - 0.1;
    });

    // Esperar a que aparezcan las tres salidas
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Seguir con esta obra') &&
             document.body.textContent.includes('Explorar las seis obras') &&
             document.body.textContent.includes('Seguir aquí, en La Consulta');
    }, { timeout: 10000 });

    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: 'public/real_desktop_three_exits.png', fullPage: false });
    console.log('Captura guardada: public/real_desktop_three_exits.png');

    await page.close();
  }

  // 2. MOBILE CAPTURE (390x844 iPhone)
  {
    console.log('\n--- 2. MOBILE (390x844 iPhone) ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.goto('http://127.0.0.1:3000/?post-p15=true', { waitUntil: 'networkidle0', timeout: 20000 });
    console.log('Móvil navegado a ?post-p15=true');

    // Esperar al contenedor
    await page.waitForSelector('[data-flow-container]', { timeout: 10000 });

    // Saltar el vídeo 1 hacia la carta
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.currentTime = (v.duration || 15) - 0.1;
    });

    // Esperar a que la carta esté montada
    await page.waitForSelector('[data-card-sheet]', { timeout: 10000 });

    // Avanzar bloques de la carta hasta el final (hasta entrar en elenasillon2)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 450));
      const hasElena2 = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v && (v.currentSrc.includes('elenasillon2') || v.innerHTML.includes('elenasillon2'));
      });
      if (hasElena2) {
        console.log('Vídeo Elena 2 activo en móvil.');
        break;
      }
      await page.keyboard.press('Space');
    }

    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'public/real_mobile_elena2_video.png', fullPage: false });
    console.log('Captura guardada: public/real_mobile_elena2_video.png');

    // Avanzar el vídeo de Elena 2 hasta el final
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.currentTime = (v.duration || 10) - 0.1;
    });

    // Esperar a que aparezcan las tres salidas
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Seguir con esta obra') &&
             document.body.textContent.includes('Explorar las seis obras') &&
             document.body.textContent.includes('Seguir aquí, en La Consulta');
    }, { timeout: 10000 });

    await new Promise(r => setTimeout(r, 700));
    // Viewport de móvil y vista completa con scroll
    await page.screenshot({ path: 'public/real_mobile_three_exits_viewport.png', fullPage: false });
    await page.screenshot({ path: 'public/real_mobile_three_exits_full.png', fullPage: true });
    console.log('Capturas guardadas: public/real_mobile_three_exits_viewport.png y full.png');

    await page.close();
  }

  await browser.close();
  console.log('\n=== CAPTURAS REALIZADAS CON ÉXITO ===');
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
