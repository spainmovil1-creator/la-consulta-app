const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runAudit() {
  console.log('--- INICIANDO AUDITORÍA DETALLADA DE LA PANTALLA DE LAS TRES SALIDAS ---');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. INSPECCIÓN EN ESCRITORIO (1440 x 900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?salidas=1&work=DD', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img[alt*="Portada"]', { timeout: 10000 });
  await delay(4000);

  // Medir contenedor e imágenes en escritorio para DD
  const desktopDataDD = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid > div > div.relative'));
    const imgs = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid img'));
    const texts = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid p'));

    return containers.map((c, idx) => {
      const cRect = c.getBoundingClientRect();
      const cStyles = window.getComputedStyle(c);
      const img = imgs[idx];
      const imgRect = img ? img.getBoundingClientRect() : null;
      const imgStyles = img ? window.getComputedStyle(img) : null;
      const text = texts[idx];
      const textRect = text ? text.getBoundingClientRect() : null;

      return {
        index: idx + 1,
        container: {
          width: cRect.width,
          height: cRect.height,
          ratio: (cRect.width / cRect.height).toFixed(3),
          display: cStyles.display,
          alignItems: cStyles.alignItems,
          justifyContent: cStyles.justifyContent,
          position: cStyles.position,
        },
        image: img ? {
          src: img.getAttribute('src'),
          renderedWidth: imgRect.width,
          renderedHeight: imgRect.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          objectFit: imgStyles.objectFit,
          aspectRatio: imgStyles.aspectRatio,
          position: imgStyles.position,
          maxHeight: imgStyles.maxHeight,
          maxWidth: imgStyles.maxWidth,
          display: imgStyles.display,
        } : null,
        distanceImgToText: (imgRect && textRect) ? (textRect.top - imgRect.bottom) : null
      };
    });
  });

  console.log('=== ESCRITORIO (1440px) - DATOS DE CONTENEDOR E IMAGEN (DD) ===');
  console.log(JSON.stringify(desktopDataDD, null, 2));

  // Tomar captura escritorio completa
  await page.screenshot({ path: 'public/auditoria_desktop_DD.png' });
  console.log('Captura guardada: public/auditoria_desktop_DD.png');

  // Repetir medición con obra horizontal PP ('El peso que no se ve')
  await page.goto('http://localhost:3000/?salidas=1&work=PP', { waitUntil: 'networkidle2' });
  await delay(4000);
  const desktopDataPP = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid > div > div.relative'));
    const imgs = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid img'));
    return containers.map((c, idx) => {
      const cRect = c.getBoundingClientRect();
      const img = imgs[idx];
      const imgRect = img ? img.getBoundingClientRect() : null;
      return {
        index: idx + 1,
        containerWidth: cRect.width,
        containerHeight: cRect.height,
        imgWidth: imgRect ? imgRect.width : null,
        imgHeight: imgRect ? imgRect.height : null,
        imgNaturalW: img ? img.naturalWidth : null,
        imgNaturalH: img ? img.naturalHeight : null,
      };
    });
  });
  console.log('=== ESCRITORIO (1440px) - DATOS DE OBRA HORIZONTAL PP ===');
  console.log(JSON.stringify(desktopDataPP, null, 2));
  await page.screenshot({ path: 'public/auditoria_desktop_PP.png' });
  console.log('Captura guardada: public/auditoria_desktop_PP.png');

  // 2. INSPECCIÓN EN MÓVIL (390 x 844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/?salidas=1&work=DD', { waitUntil: 'networkidle2' });
  
  // Captura móvil con solo la primera opción justo al iniciar voz 1 (revealedCount === 1)
  await delay(800);
  await page.screenshot({ path: 'public/auditoria_mobile_solo_salida1.png' });
  console.log('Captura guardada: public/auditoria_mobile_solo_salida1.png');

  // Esperar a que termine toda la secuencia para capturar con las 3 opciones visibles
  await delay(11000);

  const mobileDataDD = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.flex.flex-col.md\\:grid > div'));
    return items.map((item, idx) => {
      const c = item.querySelector('div.relative');
      const cRect = c ? c.getBoundingClientRect() : null;
      const cStyles = c ? window.getComputedStyle(c) : null;
      const img = item.querySelector('img');
      const imgRect = img ? img.getBoundingClientRect() : null;
      const imgStyles = img ? window.getComputedStyle(img) : null;
      const text = item.querySelector('p');
      const textRect = text ? text.getBoundingClientRect() : null;

      return {
        index: idx + 1,
        container: cRect ? {
          width: cRect.width,
          height: cRect.height,
          ratio: (cRect.width / cRect.height).toFixed(3),
          display: cStyles.display,
          alignItems: cStyles.alignItems,
          justifyContent: cStyles.justifyContent,
        } : null,
        image: img ? {
          src: img.getAttribute('src'),
          renderedWidth: imgRect.width,
          renderedHeight: imgRect.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          objectFit: imgStyles.objectFit,
          aspectRatio: imgStyles.aspectRatio,
          position: imgStyles.position,
          maxHeight: imgStyles.maxHeight,
        } : null,
        distanceImgToText: (imgRect && textRect) ? (textRect.top - imgRect.bottom) : null
      };
    });
  });

  console.log('=== MÓVIL (390px) - DATOS DE CONTENEDOR E IMAGEN (DD) ===');
  console.log(JSON.stringify(mobileDataDD, null, 2));

  // Capturas móvil con las 3 opciones visibles (scroll top y bottom)
  await page.screenshot({ path: 'public/auditoria_mobile_top_3salidas.png' });
  
  // Scroll down within the scrolling container
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto') || window;
    scrollContainer.scrollTo({ top: 900, behavior: 'instant' });
  });
  await delay(400);
  await page.screenshot({ path: 'public/auditoria_mobile_bottom_3salidas.png' });
  console.log('Capturas móviles guardadas');

  await browser.close();
  console.log('--- AUDITORÍA FINALIZADA CON ÉXITO ---');
}

runAudit().catch(err => {
  console.error('Error durante la auditoría:', err);
  process.exit(1);
});
