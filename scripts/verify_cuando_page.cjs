const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function auditCuandoPage() {
  console.log('================================================================');
  console.log('AUDITORÍA INTEGRAL DE LA PÁGINA: «CUANDO EL MAÑANA TE SECUESTRA» (CM)');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // --- 1. ESCRITORIO ---
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?salidas=1&work=CM', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const desktopInfo = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText.trim();
    const h2 = document.querySelector('h2')?.innerText.trim();
    const h3 = document.querySelector('h3')?.innerText.trim();
    const leadPhrase = document.querySelector('p.text-\\[\\#B85F43\\]')?.innerText.trim();
    const subtitle = document.querySelector('h1 + p')?.innerText.trim();
    const img = document.querySelector('img[alt*="Cuando el mañana"]');
    const imgContainer = img?.parentElement;

    const paras = Array.from(document.querySelectorAll('div.text-\\[\\#4A433D\\] p')).map(p => p.innerText.trim());
    const wordSpans = Array.from(document.querySelectorAll('[data-word-idx]')).length;

    return {
      h1,
      h2,
      h3,
      subtitle,
      leadPhrase,
      paragraphsCount: paras.length,
      paragraphsSample: paras.slice(0, 3),
      imgSrc: img ? img.getAttribute('src') : null,
      naturalWidth: img ? img.naturalWidth : 0,
      naturalHeight: img ? img.naturalHeight : 0,
      renderedWidth: img ? Math.round(img.getBoundingClientRect().width) : 0,
      renderedHeight: img ? Math.round(img.getBoundingClientRect().height) : 0,
      containerWidth: imgContainer ? Math.round(imgContainer.getBoundingClientRect().width) : 0,
      containerHeight: imgContainer ? Math.round(imgContainer.getBoundingClientRect().height) : 0,
      wordSpans,
    };
  });

  console.log('--- 1. ESCRITORIO (1440x900) ---');
  console.log('Resultados Escritorio CM:', JSON.stringify(desktopInfo, null, 2));

  // Audio Playback test on Desktop
  const playBtn = await page.waitForSelector('button[aria-label*="Escuchar a Elena"]');
  await playBtn.click();
  console.log('Pulsado botón reproducir audio...');

  const samples = [];
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 700));
    const currentHighlight = await page.evaluate(() => {
      const w = Array.from(document.querySelectorAll('[data-word-idx]')).find(el => el.className.includes('bg-[#B85F43]'));
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('lectura') || b.innerText.includes('Escuchar'));
      return {
        btnText: btn ? btn.innerText.trim() : null,
        word: w ? w.innerText : null,
        idx: w ? w.getAttribute('data-word-idx') : null,
      };
    });
    samples.push(currentHighlight);
  }
  console.log('Muestreo de sincronización de audio (5 instantes):', samples);

  await page.screenshot({ path: 'public/audit_evidence/cuando_desktop_playing.png' });

  // --- 2. MÓVIL ---
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/?salidas=1&work=CM', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const mobileInfo = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="Cuando el mañana"]');
    return {
      renderedWidth: img ? Math.round(img.getBoundingClientRect().width) : 0,
      renderedHeight: img ? Math.round(img.getBoundingClientRect().height) : 0,
    };
  });

  console.log('\n--- 2. MÓVIL (390x844) ---');
  console.log('Resultados Móvil CM:', JSON.stringify(mobileInfo, null, 2));
  await page.screenshot({ path: 'public/audit_evidence/cuando_mobile_top.png' });

  // Scroll to reading zone on mobile
  await page.evaluate(() => {
    const el = document.querySelector('div.overflow-y-auto');
    if (el) el.scrollTop = 700;
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'public/audit_evidence/cuando_mobile_zone2.png' });

  // --- 3. COMPARACIÓN CON PP Y EM ---
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/?salidas=1&work=PP', { waitUntil: 'networkidle2' });
  const ppInfo = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="El peso que no se ve"]');
    const container = img?.parentElement;
    return {
      renderedWidth: img ? Math.round(img.getBoundingClientRect().width) : 0,
      renderedHeight: img ? Math.round(img.getBoundingClientRect().height) : 0,
      containerWidth: container ? Math.round(container.getBoundingClientRect().width) : 0,
      containerHeight: container ? Math.round(container.getBoundingClientRect().height) : 0,
    };
  });

  console.log('\n--- 3. COMPARACIÓN CON PP («El peso que no se ve») ---');
  console.log('Resultados Escritorio PP:', JSON.stringify(ppInfo, null, 2));

  console.log('\n================================================================');
  console.log('COMPROBACIÓN DE EQUIVALENCIA VISUAL:');
  console.log(`CM Container: ${desktopInfo.containerWidth}x${desktopInfo.containerHeight} | PP Container: ${ppInfo.containerWidth}x${ppInfo.containerHeight}`);
  console.log(`CM Rendered:  ${desktopInfo.renderedWidth}x${desktopInfo.renderedHeight} | PP Rendered:  ${ppInfo.renderedWidth}x${ppInfo.renderedHeight}`);
  console.log('================================================================');

  await browser.close();
}

auditCuandoPage().catch(console.error);
