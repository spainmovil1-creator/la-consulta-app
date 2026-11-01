const puppeteer = require('puppeteer');

async function captureExits() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Desktop 1440x900
  const pageDesk = await browser.newPage();
  await pageDesk.setViewport({ width: 1440, height: 900 });
  await pageDesk.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });

  // Navigate to visual-checker to see exits screen directly
  await pageDesk.evaluate(() => {
    // Jump to post-p15 directly with PP
    window.history.pushState({}, '', '/?post-p15');
    window.location.reload();
  });
  await pageDesk.waitForNavigation({ waitUntil: 'networkidle0' });

  // In PostConsultationFlow, let's see if we can trigger phase three-exits directly or test ThreeExitsScreen
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/_next/static/css/app/layout.css">
    </head>
    <body>
      <div id="test-root"></div>
    </body>
    </html>
  `;
  await browser.close();
}
