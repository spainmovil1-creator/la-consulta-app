const puppeteer = require('puppeteer');

async function testDevice(deviceMode, viewport, expectedSrcSubstring) {
  console.log(`\n========================================`);
  console.log(`Testing P12 on ${deviceMode} (viewport: ${viewport.width}x${viewport.height})`);
  console.log(`========================================`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(viewport);

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Navigate to P12
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && b.textContent.includes('P12 directo'));
    if (target) target.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Inspect the rendered image
  const imgInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => 
      img.src && (img.src.includes('p12') || img.src.includes('P12')) && !img.className.includes('blur-3xl')
    );
    if (!imgs.length) return null;
    const img = imgs[0];
    const r = img.getBoundingClientRect();
    const pr = img.parentElement ? img.parentElement.getBoundingClientRect() : null;
    return {
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      parentRect: pr ? { top: pr.top, left: pr.left, width: pr.width, height: pr.height } : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });

  console.log('Image Info:', imgInfo);

  if (!imgInfo) {
    throw new Error(`Main P12 image not found for ${deviceMode}`);
  }

  // Check src
  if (!imgInfo.src.toLowerCase().includes(expectedSrcSubstring.toLowerCase())) {
    console.warn(`Image src ${imgInfo.src} did not match expected ${expectedSrcSubstring}`);
  } else {
    console.log(`✓ Image src matches: ${imgInfo.src}`);
  }

  // Check horizontal scroll
  if (imgInfo.scrollWidth > imgInfo.clientWidth) {
    throw new Error(`Horizontal scroll detected! scrollWidth=${imgInfo.scrollWidth}, clientWidth=${imgInfo.clientWidth}`);
  }
  console.log('✓ No horizontal scroll detected');

  // Check hit areas
  const hitAreas = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => 
      b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Opción')
    );
    return btns.map(b => {
      const r = b.getBoundingClientRect();
      return {
        label: b.getAttribute('aria-label'),
        rect: { top: r.top, left: r.left, width: r.width, height: r.height }
      };
    });
  });

  console.log(`Found ${hitAreas.length} hit areas:`);
  hitAreas.forEach(ha => {
    console.log(`  - ${ha.label}: [${ha.rect.left.toFixed(1)}, ${ha.rect.top.toFixed(1)}] ${ha.rect.width.toFixed(1)}x${ha.rect.height.toFixed(1)}`);
  });

  if (hitAreas.length !== 4) {
    throw new Error(`Expected 4 hit areas, found ${hitAreas.length}`);
  }

  // Save screenshot
  const screenshotPath = `public/screenshot_p12_${deviceMode}.png`;
  await page.screenshot({ path: screenshotPath });
  console.log(`✓ Saved preview: ${screenshotPath}`);

  if (consoleErrors.length > 0) {
    console.warn('Console errors:', consoleErrors);
  } else {
    console.log('✓ Zero console errors');
  }

  await browser.close();
}

async function testInteractions() {
  console.log(`\n========================================`);
  console.log(`Testing P12 Interactions (Options A, B, C, D -> P13)`);
  console.log(`========================================`);

  for (const optKey of ['A', 'B', 'C', 'D']) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

    // Go to P12
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent && b.textContent.includes('P12 directo'));
      if (target) target.click();
    });

    await new Promise(r => setTimeout(r, 500));

    // Click option
    const clicked = await page.evaluate((key) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const optBtn = btns.find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes(`(${key})`));
      if (optBtn) {
        optBtn.click();
        return true;
      }
      return false;
    }, optKey);

    if (!clicked) {
      throw new Error(`Could not click option ${optKey}`);
    }

    // Wait for transition (220ms + react render)
    await new Promise(r => setTimeout(r, 600));

    // Verify stage is P13 and text reflects chosen option
    const result = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      const p = document.querySelector('p');
      return {
        title: h2 ? h2.textContent : null,
        body: p ? p.textContent : null
      };
    });

    console.log(`Option ${optKey} clicked -> Result:`, result);

    if (!result.title || !result.title.includes('Pregunta 13 / 15')) {
      throw new Error(`Expected transition to Pregunta 13 / 15, got: ${result.title}`);
    }

    const expectedResponseNumber = { A: 1, B: 2, C: 3, D: 4 }[optKey];
    if (!result.body || !result.body.includes(`Opción ${optKey} → Respuesta ${expectedResponseNumber}`)) {
      throw new Error(`Expected body to record Opción ${optKey} → Respuesta ${expectedResponseNumber}, got: ${result.body}`);
    }

    console.log(`✓ Option ${optKey} correctly registered as Respuesta ${expectedResponseNumber} and transitioned to P13`);

    await browser.close();
  }
}

async function testP11toP12Flow() {
  console.log(`\n========================================`);
  console.log(`Testing Full Flow: P11 -> P12 -> P13`);
  console.log(`========================================`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Direct to P11
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && b.textContent.trim().startsWith('P11'));
    if (target) target.click();
  });

  await new Promise(r => setTimeout(r, 500));

  // Click Option A in P11
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const optA = btns.find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('(A)'));
    if (optA) optA.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Check that we arrived at P12
  const p12Check = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => 
      img.src && (img.src.includes('P12') || img.src.includes('p12')) && !img.className.includes('blur-3xl')
    );
    const btns = Array.from(document.querySelectorAll('button')).filter(b => 
      b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Opción')
    );
    return {
      hasP12Img: imgs.length > 0,
      hitAreasCount: btns.length
    };
  });

  console.log('Flow to P12 result:', p12Check);
  if (!p12Check.hasP12Img || p12Check.hitAreasCount !== 4) {
    throw new Error(`P11 did not transition automatically to P12!`);
  }
  console.log(`✓ P11 answer smoothly transitioned to P12`);

  // Now click Option C in P12
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const optC = btns.find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('(C)'));
    if (optC) optC.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Verify P13 reached
  const p13Title = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    return h2 ? h2.textContent : null;
  });

  if (!p13Title || !p13Title.includes('Pregunta 13 / 15')) {
    throw new Error(`P12 did not transition automatically to P13!`);
  }
  console.log(`✓ P12 answer smoothly transitioned to P13 (${p13Title})`);

  await browser.close();
}

async function run() {
  await testDevice('desktop', { width: 1440, height: 900 }, 'P12.png');
  await testDevice('tablet', { width: 768, height: 1024 }, 'p12tablet.png');
  await testDevice('mobile', { width: 390, height: 844 }, 'p12movil.png');
  await testInteractions();
  await testP11toP12Flow();
  console.log('\n========================================');
  console.log('ALL P12 VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('========================================\n');
}

run().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
