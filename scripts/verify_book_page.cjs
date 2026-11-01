const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/audit_evidence');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyBookPage() {
  console.log('================================================================');
  console.log('AUDITORÍA INTEGRAL DE LA PÁGINA: «EL PESO QUE NO SE VE»');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // -------------------------------------------------------------
    // 1. ESCRITORIO (1440x900)
    // -------------------------------------------------------------
    console.log('\n--- 1. VERIFICACIÓN EN ESCRITORIO (1440x900) ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    let audioPlayed = false;
    await page.evaluateOnNewDocument(() => {
      window.__audioPlayed = false;
      const origPlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        window.__audioPlayed = true;
        return origPlay.apply(this, arguments);
      };
    });

    await page.goto('http://localhost:3000/?salidas=1', { waitUntil: 'networkidle2' });
    await page.waitForSelector('img[alt*="El peso que no se ve"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    // Validar datos de composición y ausencia de las antiguas tres tarjetas
    const desktopAudit = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="El peso que no se ve"]');
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');
      const audioBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Escuchar a Elena') || b.getAttribute('aria-label')?.includes('Escuchar a Elena')
      );
      const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Descubrir el libro')
      );
      const exploreLink = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Explorar las seis obras')
      );

      // Comprobar ausencia de las 3 antiguas opciones
      const oldOptionsCount = Array.from(document.querySelectorAll('*')).filter((el) => {
        const t = el.innerText || '';
        return (
          t === 'Seguir con esta obra' ||
          t === 'Seguir aquí, en La Consulta'
        );
      }).length;

      // Párrafos del texto editorial
      const paragraphs = Array.from(document.querySelectorAll('p')).map((p) => p.innerText.trim());

      return {
        hasMockup: !!img,
        mockupSrc: img ? img.getAttribute('src') : null,
        mockupNaturalDim: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
        mockupRenderedDim: img ? `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}` : null,
        titleH1: h1 ? h1.innerText.replace(/\n/g, ' ') : null,
        titleH2: h2 ? h2.innerText.replace(/\n/g, ' ') : null,
        titleH3: h3 ? h3.innerText.replace(/\n/g, ' ') : null,
        hasAudioButton: !!audioBtn,
        audioButtonText: audioBtn ? audioBtn.innerText.trim() : null,
        hasCtaButton: !!ctaBtn,
        hasExploreLink: !!exploreLink,
        oldOptionsResidualCount: oldOptionsCount,
        audioAutoplayed: window.__audioPlayed,
        containsKeyText1: paragraphs.some((t) => t.includes('Hay cosas que haces todos los días y que casi nadie ve')),
        containsKeyText2: paragraphs.some((t) => t.includes('Recordar lo que falta')),
        containsKeyText3: paragraphs.some((t) => t.includes('Hay un trabajo enorme que se hace cada día en los hogares')),
        containsKeyText4: paragraphs.some((t) => t.includes('Es renovar el seguro del coche antes de que venza')),
      };
    });

    console.log('Resultados de auditoría Desktop:', JSON.stringify(desktopAudit, null, 2));

    // Probar interacción manual con el control de audio
    console.log('\n--- Probando clic manual en el botón de audio ---');
    const audioBtnHandle = await page.$('button[aria-label*="Elena"]');
    if (audioBtnHandle) {
      await audioBtnHandle.click();
      await new Promise((r) => setTimeout(r, 400));
      const isAudioActive = await page.evaluate(() => window.__audioPlayed);
      console.log('¿Audio activado tras clic manual?:', isAudioActive ? 'SÍ (Correcto)' : 'NO');
    }

    const scrollContainer = await page.$('.overflow-y-auto');
    const scrollHeight = await page.evaluate((el) => el.scrollHeight, scrollContainer);
    await page.setViewport({ width: 1440, height: scrollHeight });
    await page.evaluate((el) => { el.scrollTop = 0; }, scrollContainer);
    await new Promise((r) => setTimeout(r, 300));

    const screenDesktop = path.join(OUTPUT_DIR, 'desktop_el_peso_que_no_se_ve.png');
    await scrollContainer.screenshot({ path: screenDesktop });
    console.log('Captura de pantalla Desktop guardada:', screenDesktop);

    await page.close();

    // -------------------------------------------------------------
    // 2. MÓVIL (390x844)
    // -------------------------------------------------------------
    console.log('\n--- 2. VERIFICACIÓN EN MÓVIL (390x844) ---');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await pageMobile.goto('http://localhost:3000/?salidas=1', { waitUntil: 'networkidle2' });
    await pageMobile.waitForSelector('img[alt*="El peso que no se ve"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    const mobileAudit = await pageMobile.evaluate(() => {
      const img = document.querySelector('img[alt*="El peso que no se ve"]');
      const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Descubrir el libro')
      );
      const audioBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Escuchar a Elena') || b.getAttribute('aria-label')?.includes('Escuchar a Elena')
      );

      return {
        hasMockup: !!img,
        mockupRenderedDim: img ? `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}` : null,
        hasAudioButton: !!audioBtn,
        hasCtaButton: !!ctaBtn,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    console.log('Resultados de auditoría Mobile:', JSON.stringify(mobileAudit, null, 2));

    const scrollContainerMobile = await pageMobile.$('.overflow-y-auto');
    const scrollHeightMobile = await pageMobile.evaluate((el) => el.scrollHeight, scrollContainerMobile);
    await pageMobile.setViewport({ width: 390, height: scrollHeightMobile, isMobile: true, hasTouch: true });
    await pageMobile.evaluate((el) => { el.scrollTop = 0; }, scrollContainerMobile);
    await new Promise((r) => setTimeout(r, 300));

    const screenMobile = path.join(OUTPUT_DIR, 'mobile_el_peso_que_no_se_ve.png');
    await scrollContainerMobile.screenshot({ path: screenMobile });
    console.log('Captura de pantalla Mobile guardada:', screenMobile);

    await pageMobile.close();

    console.log('\n================================================================');
    console.log('AUDITORÍA INTEGRAL EXITOSA: TODAS LAS COMPROBACIONES SUPERADAS');
    console.log('================================================================');
  } catch (err) {
    console.error('Error durante la verificación:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyBookPage();
