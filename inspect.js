const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Test viewport
  const vp = { name: "Tablet Viewport", width: 768, height: 630 };
  await page.setViewport(vp);
  
  for (const q of ["P07", "P08"]) {
    console.log(`\n======================================================`);
    console.log(`TESTING ${q} in ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    
    // Find button containing text P07 or P08
    const buttons = await page.$$("button");
    let clicked = false;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent || el.title, b);
      if (text && text.includes(q)) {
        await b.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      console.log(`Could not find button for ${q}`);
      continue;
    }
    
    // Wait for the question screen to mount
    await page.waitForSelector("img[alt*='La Consulta']", { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));
    
    const data = await page.evaluate(() => {
      const img = document.querySelector("img[alt*='La Consulta']");
      if (!img) return { error: "No img found" };
      
      const container = img.parentElement;
      const wrapper = container ? container.parentElement : null;
      const root = wrapper ? wrapper.parentElement : null;
      
      function inspect(el, label) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = window.getComputedStyle(el);
        return {
          label,
          tag: el.tagName,
          className: el.className,
          rect: {
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            height: Math.round(r.height),
          },
          computed: {
            width: s.width,
            height: s.height,
            maxWidth: s.maxWidth,
            maxHeight: s.maxHeight,
            aspectRatio: s.aspectRatio,
            display: s.display,
            position: s.position,
            objectFit: s.objectFit,
            padding: s.padding,
            margin: s.margin,
          }
        };
      }
      
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        imgSrc: img.src,
        imgNatural: { width: img.naturalWidth, height: img.naturalHeight },
        img: inspect(img, "IMG"),
        container: inspect(container, "CONTAINER"),
        wrapper: inspect(wrapper, "WRAPPER"),
        root: inspect(root, "ROOT"),
      };
    });
    
    console.log("Image source:", data.imgSrc);
    console.log("Natural size:", data.imgNatural);
    console.log("IMG element:", JSON.stringify(data.img, null, 2));
    console.log("CONTAINER element:", JSON.stringify(data.container, null, 2));
    console.log("WRAPPER element:", JSON.stringify(data.wrapper, null, 2));
    
    await page.screenshot({ path: `public/screenshot_${q}.png` });
    console.log(`Saved screenshot to public/screenshot_${q}.png`);
  }

  await browser.close();
}

run().catch(console.error);
