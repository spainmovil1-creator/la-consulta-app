const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/audit_evidence');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyElEspejo() {
  console.log('================================================================');
  console.log('AUDITORÍA INTEGRAL DE LA PÁGINA: «EL ESPEJO QUE MIENTE» (EM)');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. ESCRITORIO
    console.log('\n--- 1. ESCRITORIO (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/?salidas=1&work=EM', { waitUntil: 'networkidle2' });
    await page.waitForSelector('img[src*="mockupelespejo.png"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));

    const desktopData = await page.evaluate(() => {
      const img = document.querySelector('img[src*="mockupelespejo.png"]');
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');
      const audioBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Escuchar a Elena') || b.getAttribute('aria-label')?.includes('Escuchar a Elena')
      );
      const paragraphs = Array.from(document.querySelectorAll('div.prose p, div.font-serif p')).map((p) => p.innerText.trim());

      const imgRect = img ? img.getBoundingClientRect() : null;
      const imgContainer = img ? img.closest('div.relative') : null;
      const containerRect = imgContainer ? imgContainer.getBoundingClientRect() : null;

      return {
        h1: h1 ? h1.innerText.trim() : null,
        h2: h2 ? h2.innerText.trim() : null,
        h3: h3 ? h3.innerText.trim() : null,
        hasAudioBtn: !!audioBtn,
        audioBtnText: audioBtn ? audioBtn.innerText.trim() : null,
        imgSrc: img ? img.getAttribute('src') : null,
        naturalWidth: img ? img.naturalWidth : null,
        naturalHeight: img ? img.naturalHeight : null,
        renderedWidth: imgRect ? Math.round(imgRect.width) : null,
        renderedHeight: imgRect ? Math.round(imgRect.height) : null,
        containerWidth: containerRect ? Math.round(containerRect.width) : null,
        containerHeight: containerRect ? Math.round(containerRect.height) : null,
        paragraphsCount: paragraphs.length,
        paragraphsSample: paragraphs.slice(0, 5),
      };
    });

    console.log('Resultados Escritorio EM:', JSON.stringify(desktopData, null, 2));

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'elespejo_desktop.png'),
      fullPage: false,
    });

    // 2. MÓVIL
    console.log('\n--- 2. MÓVIL (390x844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/?salidas=1&work=EM', { waitUntil: 'networkidle2' });
    await page.waitForSelector('img[src*="mockupelespejo.png"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));

    const mobileData = await page.evaluate(() => {
      const img = document.querySelector('img[src*="mockupelespejo.png"]');
      const imgRect = img ? img.getBoundingClientRect() : null;
      return {
        renderedWidth: imgRect ? Math.round(imgRect.width) : null,
        renderedHeight: imgRect ? Math.round(imgRect.height) : null,
      };
    });

    console.log('Resultados Móvil EM:', JSON.stringify(mobileData, null, 2));

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'elespejo_mobile.png'),
      fullPage: false,
    });

    // 3. COMPARAR CON PP
    console.log('\n--- 3. COMPARACIÓN CON PP («El peso que no se ve») ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/?salidas=1&work=PP', { waitUntil: 'networkidle2' });
    await page.waitForSelector('img[src*="mockupelpesoquenoseve.png"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));

    const ppData = await page.evaluate(() => {
      const img = document.querySelector('img[src*="mockupelpesoquenoseve.png"]');
      const imgRect = img ? img.getBoundingClientRect() : null;
      const imgContainer = img ? img.closest('div.relative') : null;
      const containerRect = imgContainer ? imgContainer.getBoundingClientRect() : null;
      return {
        renderedWidth: imgRect ? Math.round(imgRect.width) : null,
        renderedHeight: imgRect ? Math.round(imgRect.height) : null,
        containerWidth: containerRect ? Math.round(containerRect.width) : null,
        containerHeight: containerRect ? Math.round(containerRect.height) : null,
      };
    });

    console.log('Resultados Escritorio PP:', JSON.stringify(ppData, null, 2));

    console.log('\n================================================================');
    console.log('COMPROBACIÓN DE EQUIVALENCIA VISUAL:');
    console.log(`EM Container: ${desktopData.containerWidth}x${desktopData.containerHeight} | PP Container: ${ppData.containerWidth}x${ppData.containerHeight}`);
    console.log(`EM Rendered:  ${desktopData.renderedWidth}x${desktopData.renderedHeight} | PP Rendered:  ${ppData.renderedWidth}x${ppData.renderedHeight}`);
    console.log('================================================================');

  } finally {
    await browser.close();
  }
}

verifyElEspejo().catch((err) => {
  console.error(err);
  process.exit(1);
});
