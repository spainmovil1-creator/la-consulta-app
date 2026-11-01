const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024 });

  for (const q of ["P07", "P08"]) {
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate((qid) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find(b => b.textContent && b.textContent.includes(qid));
      if (target) target.click();
    }, q);

    await new Promise(r => setTimeout(r, 800));

    const result = await page.evaluate(() => {
      const img = document.querySelector("div.relative.z-10 img");
      if (!img) return { error: "No image found" };
      const container = img.parentElement;
      const r = img.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      const s = window.getComputedStyle(img);
      const cs = window.getComputedStyle(container);
      return {
        src: img.src,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        imgRect: { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) },
        containerRect: { top: Math.round(cr.top), bottom: Math.round(cr.bottom), width: Math.round(cr.width), height: Math.round(cr.height) },
        containerClasses: container.className,
        containerAspectRatio: cs.aspectRatio,
        containerMaxWidth: cs.maxWidth,
        containerMaxHeight: cs.maxHeight,
        imgObjectFit: s.objectFit,
      };
    });

    console.log(`\n=== RESULTS FOR ${q} in 768x1024 ===`);
    console.log(JSON.stringify(result, null, 2));
  }

  await browser.close();
}

run().catch(console.error);
