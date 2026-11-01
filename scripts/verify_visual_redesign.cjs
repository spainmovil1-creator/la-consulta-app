const puppeteer = require('puppeteer');

async function testScreenshots() {
  console.log('--- VERIFICANDO REDISEÑO VISUAL Y RESPONSIVE ---');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  // TEST 1: ESCRITORIO (1440x900) - TRES SALIDAS
  {
    console.log('\n[1] Capturando Tres Salidas en Escritorio (1440x900)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Clic en Comprobación Visual
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Comprobación Visual')) {
        await btn.click();
        break;
      }
    }

    await page.waitForFunction(() => document.body.textContent.includes('Selector de Comprobación'));
    const card1Button = await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('#1') || b.textContent.includes('Carta 1'));
    });
    await card1Button.click();

    await page.waitForSelector('[data-flow-container]');

    // Avanzar todos los bloques de la carta
    console.log('Avanzando carta hasta el final...');
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(400);
      const isVideo = await page.evaluate(() => {
        return !!document.querySelector('video') && !document.querySelector('[data-card-sheet]');
      });
      if (isVideo) {
        console.log('Entrado al vídeo de Elena.');
        break;
      }
      await page.keyboard.press('Space');
    }

    // Esperar al vídeo de Elena 2
    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return v && (v.currentSrc.includes('elenasillon2') || v.innerHTML.includes('elenasillon2'));
    }, { timeout: 8000 });

    console.log('Avanzando vídeo de Elena 2 al final...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) {
        v.currentTime = (v.duration || 10) - 0.1;
      }
    });

    // Esperar a que aparezca la pantalla de las tres salidas
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Seguir con esta obra') &&
             document.body.textContent.includes('Explorar las seis obras') &&
             document.body.textContent.includes('Seguir aquí, en La Consulta');
    }, { timeout: 10000 });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'public/redesign_desktop_three_exits.png', fullPage: false });
    console.log('Guardada captura: public/redesign_desktop_three_exits.png');
    await page.close();
  }

  // TEST 2: MÓVIL (390x844 - iPhone) - TRES SALIDAS & VÍDEO ELENA
  {
    console.log('\n[2] Capturando Móvil iPhone (390x844)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Clic en Comprobación Visual
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Comprobación Visual')) {
        await btn.click();
        break;
      }
    }

    await page.waitForFunction(() => document.body.textContent.includes('Selector de Comprobación'));
    const card1Button = await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('#1') || b.textContent.includes('Carta 1'));
    });
    await card1Button.click();

    await page.waitForSelector('[data-flow-container]');

    // Avanzar todos los bloques de la carta
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(400);
      const isVideo = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v && (v.currentSrc.includes('elenasillon2') || v.innerHTML.includes('elenasillon2'));
      });
      if (isVideo) {
        console.log('Vídeo Elena 2 activo en móvil.');
        break;
      }
      await page.keyboard.press('Space');
    }

    await page.waitForTimeout(500);
    // Captura del vídeo de Elena 2 en móvil
    await page.screenshot({ path: 'public/redesign_mobile_video_elena.png', fullPage: false });
    console.log('Guardada captura vídeo: public/redesign_mobile_video_elena.png');

    // Avanzar el vídeo al final
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) {
        v.currentTime = (v.duration || 10) - 0.1;
      }
    });

    // Esperar a que aparezcan las tres salidas
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Seguir con esta obra') &&
             document.body.textContent.includes('Explorar las seis obras') &&
             document.body.textContent.includes('Seguir aquí, en La Consulta');
    }, { timeout: 10000 });

    await page.waitForTimeout(600);
    // Captura pantalla completa móvil de las tres salidas
    await page.screenshot({ path: 'public/redesign_mobile_three_exits_viewport.png', fullPage: false });
    await page.screenshot({ path: 'public/redesign_mobile_three_exits_fullpage.png', fullPage: true });
    console.log('Guardadas capturas móvil: public/redesign_mobile_three_exits_viewport.png y fullpage.png');
    await page.close();
  }

  await browser.close();
  console.log('\n--- VERIFICACIÓN COMPLETADA EXITOSAMENTE ---');
}

testScreenshots().catch(err => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
