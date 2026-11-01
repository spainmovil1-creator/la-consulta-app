const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Set viewport to tablet
  await page.setViewport({ width: 768, height: 630 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });

  // List all buttons on page
  const buttonTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).map(b => b.innerText || b.textContent);
  });
  console.log("Buttons found on intro:", buttonTexts);

  // Click P08 directo
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const p08Btn = btns.find(b => b.textContent && b.textContent.includes("P08"));
    if (p08Btn) p08Btn.click();
  });

  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));

  // Now inspect all images on page
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).map(img => {
      const r = img.getBoundingClientRect();
      const s = window.getComputedStyle(img);
      const pr = img.parentElement ? img.parentElement.getBoundingClientRect() : null;
      const ps = img.parentElement ? window.getComputedStyle(img.parentElement) : null;
      return {
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        className: img.className,
        rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height },
        computed: { width: s.width, height: s.height, maxWidth: s.maxWidth, maxHeight: s.maxHeight, objectFit: s.objectFit },
        parentRect: pr ? { top: pr.top, bottom: pr.bottom, left: pr.left, right: pr.right, width: pr.width, height: pr.height } : null,
        parentComputed: ps ? { width: ps.width, height: ps.height, maxWidth: ps.maxWidth, maxHeight: ps.maxHeight, aspectRatio: ps.aspectRatio, display: ps.display } : null,
        parentClass: img.parentElement ? img.parentElement.className : null
      };
    });
  });

  console.log("\n=== IMAGES FOUND AFTER CLICKING P08 ===");
  console.log(JSON.stringify(images, null, 2));

  await page.screenshot({ path: "public/screenshot_p08_test.png" });
  console.log("Saved public/screenshot_p08_test.png");

  await browser.close();
}

run().catch(console.error);
