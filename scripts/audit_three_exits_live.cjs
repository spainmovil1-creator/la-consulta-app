const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/audit_evidence');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('====================================================');
  console.log('AUDITORÍA COMPLETA DE LA PANTALLA DE LAS TRES SALIDAS');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const report = {
    desktop: {},
    mobile: {},
  };

  try {
    // -------------------------------------------------------------
    // PARTE 1: VERIFICACIÓN EN ESCRITORIO (1440x900)
    // -------------------------------------------------------------
    console.log('\n--- 1. VERIFICACIÓN EN ESCRITORIO (1440x900) ---');
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900 });

    const worksToTest = [
      { code: 'DD', title: 'El día que dejé de ser' },
      { code: 'PP', title: 'El peso que no se ve' },
      { code: 'EM', title: 'El espejo que miente' },
    ];

    for (const work of worksToTest) {
      console.log(`\nProbando escritorio con obra: ${work.code} (${work.title})...`);
      await pageDesktop.goto(`http://localhost:3000/?salidas=1&work=${work.code}`, {
        waitUntil: 'networkidle2',
      });

      // Esperar a que la secuencia de 3 voces termine y las 3 opciones sean visibles
      await pageDesktop.waitForFunction(() => {
        const options = Array.from(document.querySelectorAll('.group[role="button"]'));
        if (options.length < 3) return false;
        return options.every(opt => window.getComputedStyle(opt).visibility !== 'hidden' && parseFloat(window.getComputedStyle(opt).opacity) > 0.8);
      }, { timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));

      const metrics = await pageDesktop.evaluate(() => {
        const options = Array.from(document.querySelectorAll('.group[role="button"]'));
        return options.map((opt, idx) => {
          const img = opt.querySelector('img');
          const title = opt.querySelector('p');
          const imgContainer = img ? img.parentElement : null;
          const optRect = opt.getBoundingClientRect();
          const imgRect = img ? img.getBoundingClientRect() : null;
          const containerRect = imgContainer ? imgContainer.getBoundingClientRect() : null;
          const titleRect = title ? title.getBoundingClientRect() : null;
          const imgStyles = img ? window.getComputedStyle(img) : null;
          const containerStyles = imgContainer ? window.getComputedStyle(imgContainer) : null;

          return {
            index: idx + 1,
            titleText: title ? title.innerText.trim() : '',
            container: {
              width: containerRect ? Math.round(containerRect.width) : 0,
              height: containerRect ? Math.round(containerRect.height) : 0,
              aspectRatio: containerRect && containerRect.height ? (containerRect.width / containerRect.height).toFixed(3) : 0,
              display: containerStyles ? containerStyles.display : '',
              alignItems: containerStyles ? containerStyles.alignItems : '',
            },
            image: {
              src: img ? img.getAttribute('src') : '',
              naturalWidth: img ? img.naturalWidth : 0,
              naturalHeight: img ? img.naturalHeight : 0,
              renderedWidth: imgRect ? Math.round(imgRect.width) : 0,
              renderedHeight: imgRect ? Math.round(imgRect.height) : 0,
              objectFit: imgStyles ? imgStyles.objectFit : '',
              objectPosition: imgStyles ? imgStyles.objectPosition : '',
            },
            titleTop: titleRect ? Math.round(titleRect.top) : 0,
            titleBottom: titleRect ? Math.round(titleRect.bottom) : 0,
            optionWidth: Math.round(optRect.width),
            optionHeight: Math.round(optRect.height),
          };
        });
      });

      report.desktop[work.code] = metrics;
      console.log(`Métricas para ${work.code}:`, JSON.stringify(metrics, null, 2));

      // Guardar captura real
      const screenshotPath = path.join(OUTPUT_DIR, `desktop_${work.code.toLowerCase()}_3options.png`);
      await pageDesktop.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Captura guardada en: ${screenshotPath}`);
    }

    await pageDesktop.close();

    // -------------------------------------------------------------
    // PARTE 2: VERIFICACIÓN EN MÓVIL (390x844) - UNA OPCIÓN POR BLOQUE Y AUDIO EN SCROLL
    // -------------------------------------------------------------
    console.log('\n--- 2. VERIFICACIÓN EN MÓVIL (390x844) ---');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    // Escuchar eventos de audio en el navegador
    await pageMobile.evaluateOnNewDocument(() => {
      window.__audioEvents = [];
      const origPlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        const src = this.src || '';
        window.__audioEvents.push({
          type: 'play',
          src: src.split('/').pop(),
          time: Date.now(),
        });
        return origPlay.apply(this, arguments);
      };
      const origPause = HTMLMediaElement.prototype.pause;
      HTMLMediaElement.prototype.pause = function () {
        const src = this.src || '';
        window.__audioEvents.push({
          type: 'pause',
          src: src.split('/').pop(),
          time: Date.now(),
        });
        return origPause.apply(this, arguments);
      };
    });

    console.log('Cargando móvil con obra DD...');
    await pageMobile.goto('http://localhost:3000/?salidas=1&work=DD', {
      waitUntil: 'networkidle2',
    });

    // Estado inicial en móvil: Bloque 1 en pantalla
    await pageMobile.waitForSelector('.group[role="button"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    const mobileBlock1 = await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      const opt1 = options[0];
      const img1 = opt1 ? opt1.querySelector('img') : null;
      const r1 = opt1 ? opt1.getBoundingClientRect() : null;
      const ir1 = img1 ? img1.getBoundingClientRect() : null;

      return {
        blockCount: options.length,
        block1: {
          width: r1 ? Math.round(r1.width) : 0,
          height: r1 ? Math.round(r1.height) : 0,
          top: r1 ? Math.round(r1.top) : 0,
          bottom: r1 ? Math.round(r1.bottom) : 0,
          inViewport: r1 ? r1.top < window.innerHeight && r1.bottom > 0 : false,
          imgWidth: ir1 ? Math.round(ir1.width) : 0,
          imgHeight: ir1 ? Math.round(ir1.height) : 0,
        },
        audioEvents: window.__audioEvents,
      };
    });

    report.mobile.block1 = mobileBlock1;
    console.log('Móvil Bloque 1:', JSON.stringify(mobileBlock1, null, 2));

    const screenMob1 = path.join(OUTPUT_DIR, 'mobile_block1_view.png');
    await pageMobile.screenshot({ path: screenMob1 });
    console.log(`Captura móvil Bloque 1 guardada en: ${screenMob1}`);

    // Desplazar hacia el Bloque 2 (Explorar las seis obras)
    console.log('\nDesplazando en móvil hacia el Bloque 2...');
    await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      if (options[1]) {
        options[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await new Promise((r) => setTimeout(r, 1200));

    const mobileBlock2 = await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      const opt2 = options[1];
      const img2 = opt2 ? opt2.querySelector('img') : null;
      const r2 = opt2 ? opt2.getBoundingClientRect() : null;
      const ir2 = img2 ? img2.getBoundingClientRect() : null;

      return {
        block2: {
          width: r2 ? Math.round(r2.width) : 0,
          height: r2 ? Math.round(r2.height) : 0,
          top: r2 ? Math.round(r2.top) : 0,
          bottom: r2 ? Math.round(r2.bottom) : 0,
          inViewport: r2 ? r2.top < window.innerHeight && r2.bottom > 0 : false,
          imgWidth: ir2 ? Math.round(ir2.width) : 0,
          imgHeight: ir2 ? Math.round(ir2.height) : 0,
        },
        audioEvents: window.__audioEvents,
      };
    });

    report.mobile.block2 = mobileBlock2;
    console.log('Móvil Bloque 2:', JSON.stringify(mobileBlock2, null, 2));

    const screenMob2 = path.join(OUTPUT_DIR, 'mobile_block2_view.png');
    await pageMobile.screenshot({ path: screenMob2 });
    console.log(`Captura móvil Bloque 2 guardada en: ${screenMob2}`);

    // Desplazar hacia el Bloque 3 (Seguir aquí, en La Consulta)
    console.log('\nDesplazando en móvil hacia el Bloque 3...');
    await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      if (options[2]) {
        options[2].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await new Promise((r) => setTimeout(r, 1200));

    const mobileBlock3 = await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      const opt3 = options[2];
      const img3 = opt3 ? opt3.querySelector('img') : null;
      const r3 = opt3 ? opt3.getBoundingClientRect() : null;
      const ir3 = img3 ? img3.getBoundingClientRect() : null;

      return {
        block3: {
          width: r3 ? Math.round(r3.width) : 0,
          height: r3 ? Math.round(r3.height) : 0,
          top: r3 ? Math.round(r3.top) : 0,
          bottom: r3 ? Math.round(r3.bottom) : 0,
          inViewport: r3 ? r3.top < window.innerHeight && r3.bottom > 0 : false,
          imgWidth: ir3 ? Math.round(ir3.width) : 0,
          imgHeight: ir3 ? Math.round(ir3.height) : 0,
        },
        audioEvents: window.__audioEvents,
      };
    });

    report.mobile.block3 = mobileBlock3;
    console.log('Móvil Bloque 3:', JSON.stringify(mobileBlock3, null, 2));

    const screenMob3 = path.join(OUTPUT_DIR, 'mobile_block3_view.png');
    await pageMobile.screenshot({ path: screenMob3 });
    console.log(`Captura móvil Bloque 3 guardada en: ${screenMob3}`);

    // Desplazar hacia arriba de vuelta al Bloque 1 y comprobar que NO se reinicia el audio
    console.log('\nDesplazando de vuelta hacia el Bloque 1 (comprobación de NO reinicio de audio)...');
    const audioCountBeforeScrollUp = mobileBlock3.audioEvents.filter((e) => e.type === 'play').length;

    await pageMobile.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.group[role="button"]'));
      if (options[0]) {
        options[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    await new Promise((r) => setTimeout(r, 1500));

    const scrollUpCheck = await pageMobile.evaluate((countBefore) => {
      const plays = window.__audioEvents.filter((e) => e.type === 'play');
      return {
        countBefore,
        countAfter: plays.length,
        replayed: plays.length > countBefore,
        allEvents: window.__audioEvents,
      };
    }, audioCountBeforeScrollUp);

    report.mobile.scrollUpCheck = scrollUpCheck;
    console.log('Comprobación de Scroll inverso:', JSON.stringify(scrollUpCheck, null, 2));

    await pageMobile.close();

    // Guardar informe JSON completo
    fs.writeFileSync(path.join(OUTPUT_DIR, 'audit_report.json'), JSON.stringify(report, null, 2));
    console.log('\nInforme JSON de auditoría guardado con éxito.');
  } catch (err) {
    console.error('Error durante la auditoría:', err);
  } finally {
    await browser.close();
  }
}

runAudit();
