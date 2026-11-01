const puppeteer = require('puppeteer');

async function testPositions() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });

  const positions = [
    '48%',
    '50%',
    '53%', // current in codebase
    '55%',
    '57%',
    '59%',
    '61%',
    '63%'
  ];

  for (const pos of positions) {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: 390px; height: 844px; overflow: hidden; background: #000; position: relative; }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: ${pos} center;
          }
          .line {
            position: absolute;
            top: 0; bottom: 0; left: 50%;
            width: 2px;
            background: rgba(255, 0, 0, 0.8);
            z-index: 100;
          }
          .label {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 101;
            color: #fff;
            background: rgba(0,0,0,0.7);
            padding: 4px 8px;
            font-family: sans-serif;
            font-size: 14px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="label">object-position: ${pos} center</div>
        <div class="line"></div>
        <img src="http://127.0.0.1:3000/elena_p15_raw.jpg" />
      </body>
      </html>
    `);
    await page.screenshot({ path: `public/pos_${pos.replace('%', '')}.png` });
  }

  console.log('Saved all position screenshots');
  await browser.close();
}
testPositions();
