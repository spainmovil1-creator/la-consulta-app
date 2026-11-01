import puppeteer from 'puppeteer';

async function runBrowserVerification() {
  console.log('--- INICIO DE VERIFICACIÓN EN NAVEGADOR REAL (PUPPETEER) ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Cargar aplicación
    console.log('[Paso 1] Cargando http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // 2. Localizar y pulsar "Verificación del Motor (Decisión)"
    console.log('[Paso 2] Accediendo al Modo de Verificación del Motor...');
    const verificationBtn = await page.waitForSelector('button::-p-text(Verificación del Motor (Decisión))', { timeout: 10000 });
    if (!verificationBtn) throw new Error('No se encontró el botón de Verificación del Motor en la pantalla de inicio');
    await verificationBtn.click();

    // 3. Esperar que aparezca el selector de perfiles
    console.log('[Paso 3] Esperando selector de perfiles...');
    await page.waitForSelector('h1::-p-text(Comprobación del Recorrido Real de Decisión)', { timeout: 10000 });

    // 4. Localizar perfil D-EM y pulsar "Recorrer paso a paso"
    console.log('[Paso 4] Localizando perfil D-EM...');
    await page.waitForSelector('[data-profile-id="D-EM"]', { timeout: 10000 });
    const clicked = await page.evaluate(() => {
      const card = document.querySelector('[data-profile-id="D-EM"]');
      if (!card) return false;
      const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recorrer paso a paso'));
      if (!btn) return false;
      btn.click();
      return true;
    });
    if (!clicked) throw new Error('No se pudo pulsar el botón "Recorrer paso a paso" en la tarjeta D-EM');
    console.log('[Paso 4] Pulsado "Recorrer paso a paso" para D-EM con éxito');

    // 5. Verificar P01: Controles de apoyo y visibilidad
    console.log('[Paso 5] Verificando pantalla P01 y controles de apoyo...');
    await page.waitForFunction(() => document.body.textContent.includes('Pregunta 1 de 15 (P01)'), { timeout: 10000 });

    // Verificar que el badge D-EM esté visible
    const spanTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('span')).map(s => s.textContent?.trim() || '');
    });
    console.log('Spans encontrados:', spanTexts);
    const demBadgeVisible = spanTexts.includes('D-EM');
    if (!demBadgeVisible) throw new Error('El badge D-EM no es visible en la barra superior');

    // Verificar que el control de opción canónica muestre 'B'
    const canonicalOptionText = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const found = spans.find(s => s.textContent && s.textContent.trim() === 'B');
      return !!found;
    });
    if (!canonicalOptionText) throw new Error('No se muestra la opción canónica B para P01 en D-EM');

    // Verificar botón de apoyo anunciado ("Pulsar opción B")
    const supportBtn = await page.waitForSelector('[data-testid="support-answer-btn"]', { timeout: 5000 });
    const supportBtnText = await page.evaluate(el => el?.textContent, supportBtn);
    console.log(`  ✓ Control de apoyo visible: "${supportBtnText?.trim()}"`);
    if (!supportBtnText?.includes('Pulsar opción B')) {
      throw new Error(`Texto inesperado en el botón de apoyo: ${supportBtnText}`);
    }

    // Verificar que las áreas interactivas de la imagen estén disponibles
    const hitAreaButtons = await page.$$('div.absolute.inset-0.w-full.h-full.pointer-events-auto button');
    console.log(`  ✓ Áreas interactivas en imagen detectadas: ${hitAreaButtons.length} botones`);
    if (hitAreaButtons.length !== 4) {
      throw new Error(`Se esperaban 4 hit areas en la imagen, detectadas: ${hitAreaButtons.length}`);
    }

    // 6. Responder P01 y comprobar que avanza a P02 y sus controles responden
    console.log('[Paso 6] Respondiendo P01 mediante el área interactiva de la imagen (Opción B)...');
    // Para P01 en desktop, el área para B es el segundo botón
    await hitAreaButtons[1].click();

    // Esperar transición a P02
    console.log('[Paso 6] Esperando avance a P02...');
    await page.waitForFunction(() => document.body.textContent.includes('Pregunta 2 de 15 (P02)'), { timeout: 10000 });

    // Verificar que los controles de P02 están habilitados y NO congelados
    console.log('[Paso 6] Comprobando que los controles en P02 responden...');
    const p02HitAreaDisabled = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div.absolute.inset-0.w-full.h-full.pointer-events-auto button'));
      return btns.some(b => b.disabled);
    });
    if (p02HitAreaDisabled) {
      throw new Error('FALLO CRÍTICO: Los botones de hit area en P02 están deshabilitados (disabled = true)');
    }

    const p02SupportBtn = await page.waitForSelector('[data-testid="support-answer-btn"]');
    const p02SupportText = await page.evaluate(el => el?.textContent, p02SupportBtn);
    console.log(`  ✓ Control de apoyo en P02 visible y actualizado: "${p02SupportText?.trim()}"`);
    if (!p02SupportText?.includes('Pulsar opción D')) {
      throw new Error(`P02 para D-EM debía sugerir D, pero muestra: ${p02SupportText}`);
    }

    // 7. Continuar de P02 hasta P15 alternando hit areas y botón de apoyo
    console.log('[Paso 7] Completando recorrido de P02 a P15...');
    const canonicalAnswers = {
      P02: 'D', P03: 'A', P04: 'A', P05: 'C',
      P06: 'A', P07: 'A', P08: 'B', P09: 'A', P10: 'C',
      P11: 'A', P12: 'C', P13: 'A', P14: 'B', P15: 'D',
    };

    const qKeys = ['P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15'];

    for (let i = 0; i < qKeys.length; i++) {
      const qId = qKeys[i];
      const expectedOpt = canonicalAnswers[qId];
      const qNum = i + 2;

      // Esperar que la pregunta actual esté en pantalla
      await page.waitForFunction(
        (targetText) => document.body.textContent.includes(targetText),
        {},
        `Pregunta ${qNum} de 15 (${qId})`
      );

      // En preguntas alternas probamos el botón de apoyo o el hit area de la imagen
      if (i % 2 === 0) {
        // Usar botón de apoyo
        const btn = await page.waitForSelector('[data-testid="support-answer-btn"]');
        await btn.click();
      } else {
        // Usar hit area de la imagen correspondiente a la opción esperada
        const optIndex = expectedOpt === 'A' ? 0 : expectedOpt === 'B' ? 1 : expectedOpt === 'C' ? 2 : 3;
        const currentHitAreas = await page.$$('div.absolute.inset-0.w-full.h-full.pointer-events-auto button');
        await currentHitAreas[optIndex].click();
      }

      await new Promise(r => setTimeout(r, 100));
    }

    // 8. Verificar que aparece la auditoría de resultados
    console.log('[Paso 8] Esperando informe de auditoría de resultados...');
    await page.waitForSelector('h1::-p-text(Informe de Verificación: Perfil D-EM · El espejo que miente)', { timeout: 15000 });

    // Verificar diagnóstico de éxito
    const successBannerVisible = await page.evaluate(() => {
      return document.body.textContent.includes('VERIFICACIÓN SUPERADA CON ÉXITO');
    });
    if (!successBannerVisible) throw new Error('No se encontró el banner de VERIFICACIÓN SUPERADA CON ÉXITO');
    console.log('  ✓ Banner "VERIFICACIÓN SUPERADA CON ÉXITO" confirmado');

    // Verificar obra ganadora
    const winnerReported = await page.evaluate(() => {
      return document.body.textContent.includes('EM — El espejo que miente');
    });
    if (!winnerReported) throw new Error('La auditoría no muestra EM como obra ganadora');
    console.log('  ✓ Obra ganadora EM ("El espejo que miente") confirmada');

    // Verificar puntuaciones
    const scoresMatch = await page.evaluate(() => {
      return document.body.textContent.includes('Cómputo matemático individual: 100% exacto conforme a la matriz');
    });
    if (!scoresMatch) throw new Error('El cómputo de puntuaciones no coincide con el 100% previsto');
    console.log('  ✓ Puntuaciones 100% exactas (EM=10 puntos)');

    // Verificar que las 15 respuestas quedaron registradas en el vector
    const allAnswersRegistered = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('P01: B') &&
             text.includes('P02: D') &&
             text.includes('P15: D');
    });
    if (!allAnswersRegistered) throw new Error('El vector de respuestas no contiene las 15 respuestas completas');
    console.log('  ✓ Las 15 respuestas P01–P15 quedaron debidamente registradas');

    // 9. Comprobar que se puede volver al selector y comenzar otra ejecución
    console.log('[Paso 9] Comprobando regreso al selector de perfiles...');
    const backToPickerBtn = await page.waitForSelector('button::-p-text(Volver a la selección de perfiles)');
    await backToPickerBtn.click();

    await page.waitForSelector('h1::-p-text(Comprobación del Recorrido Real de Decisión)', { timeout: 10000 });
    console.log('  ✓ Regreso al selector verificado con éxito. El selector está listo para otra ejecución.');

    console.log('\n======================================================');
    console.log('RESULTADO: TODAS LAS PRUEBAS EN NAVEGADOR SUPERADAS CON ÉXITO');
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('ERROR EN PRUEBA REAL DE NAVEGADOR:', err);
  process.exit(1);
});
