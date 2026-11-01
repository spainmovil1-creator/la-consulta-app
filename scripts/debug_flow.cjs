const puppeteer = require('puppeteer');

async function debugFlow() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

  console.log('Clicking button Post-P15 via Puppeteer handle...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Post-P15')) {
      await b.click();
      console.log('Puppeteer clicked Post-P15 button!');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  const hasFlow = await page.evaluate(() => {
    return {
      hasFlowContainer: !!document.querySelector('[data-flow-container]'),
      bodyText: document.body.textContent.slice(0, 200),
      html: document.body.innerHTML.slice(0, 300)
    };
  });

  console.log('Result after 1s:', hasFlow);
  await browser.close();
}

debugFlow().catch(console.error);
