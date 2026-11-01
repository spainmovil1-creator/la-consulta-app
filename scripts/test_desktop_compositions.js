const puppeteer = require('puppeteer');

async function testCompositions() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const testCases = [
    { code: 'DD', file: 'MOCKUPeldiaquedejedeser.png', title: 'El día que dejé de ser' },
    { code: 'PP', file: 'MOCKUPelpesoquenoseve.PNG', title: 'El peso que no se ve' },
    { code: 'EM', file: 'MOCKUPelespejoquemiente.png', title: 'El espejo que miente' },
    { code: 'UC', file: 'MOCKUPlaultimacerteza.png', title: 'La única certeza' },
  ];

  for (const tc of testCases) {
    const isPP = tc.code === 'PP';
    const isEM = tc.code === 'EM';
    const isUC = tc.code === 'UC';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #F9F5EE;
            background-image: radial-gradient(130% 110% at 50% 20%, #FFFDF9 0%, #F9F5EE 42%, #EFE8DC 78%, #E3D7C5 100%);
            min-height: 100vh;
            font-family: serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 30px 40px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 48px;
            max-width: 1360px;
            width: 100%;
            align-items: end;
          }
          .col {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          /* Contenedor de imagen: altura generosa aprovechando el viewport */
          .img-box {
            width: 100%;
            height: 480px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            position: relative;
            overflow: hidden;
            border-radius: 6px;
          }
          /* Estilo base de imagen */
          .img-art {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 18px 40px -8px rgba(36,26,20,0.18), 0 8px 18px -3px rgba(36,26,20,0.08);
          }
          /* Tratamiento específico de PP para presentar el libro con escala vertical comparable */
          .img-art-pp {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 46% center;
            border-radius: 4px;
            box-shadow: 0 18px 40px -8px rgba(36,26,20,0.18), 0 8px 18px -3px rgba(36,26,20,0.08);
          }
          .title {
            margin-top: 20px;
            font-size: 20px;
            color: #241A14;
            text-align: center;
            letter-spacing: 0.012em;
          }
        </style>
      </head>
      <body>
        <div class="grid">
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/${tc.file}" class="${isPP ? 'img-art-pp' : 'img-art'}" />
            </div>
            <p class="title">Seguir con esta obra</p>
          </div>
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/mockupglobal.png" class="img-art" />
            </div>
            <p class="title">Explorar las seis obras</p>
          </div>
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/sillonterceraopcion.png" class="img-art" />
            </div>
            <p class="title">Seguir aquí, en La Consulta</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `public/comp_${tc.code}.png` });
    console.log(`Saved public/comp_${tc.code}.png`);
  }

  await browser.close();
}

testCompositions().catch(console.error);
