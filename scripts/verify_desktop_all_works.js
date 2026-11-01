const puppeteer = require('puppeteer');

async function testAllWorks() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const works = [
    { code: 'DD', title: 'El día que dejé de ser' },
    { code: 'PP', title: 'El peso que no se ve' },
    { code: 'EM', title: 'El espejo que miente' },
    { code: 'CM', title: 'Cuando el mañana te secuestra' },
    { code: 'ES', title: 'El eco del silencio' },
    { code: 'UC', title: 'La única certeza' }
  ];

  for (const w of works) {
    const isPP = w.code === 'PP';
    const isEM = w.code === 'EM';
    const isUC = w.code === 'UC';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #F9F5EE;
            background-image: radial-gradient(130% 110% at 50% 20%, #FFFDF9 0%, #F9F5EE 42%, #EFE8DC 78%, #E3D7C5 100%);
            min-height: 100vh;
            font-family: Georgia, serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 30px 48px;
          }
          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #7A6A5E;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 48px;
            max-width: 1340px;
            width: 100%;
            align-items: end;
          }
          .col {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .img-box {
            width: 100%;
            height: 470px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            position: relative;
            padding: 4px;
          }
          .img-standard {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 4px;
            box-shadow: 0 16px 36px -8px rgba(36,26,20,0.16), 0 6px 14px -3px rgba(36,26,20,0.08);
          }
          /* PP: tratamiento de encuadre vertical para presencia comparable sin deformación ni corte de portada */
          .img-pp-framed {
            width: 100%;
            max-width: 330px;
            height: 100%;
            object-fit: cover;
            object-position: 46% center;
            border-radius: 4px;
            box-shadow: 0 16px 36px -8px rgba(36,26,20,0.16), 0 6px 14px -3px rgba(36,26,20,0.08);
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
        <header>
          <div>↺ Inicio</div>
          <div>Volumen</div>
        </header>
        <div class="grid">
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/${
                w.code === 'DD' ? 'MOCKUPeldiaquedejedeser.png' :
                w.code === 'PP' ? 'MOCKUPelpesoquenoseve.PNG' :
                w.code === 'EM' ? 'MOCKUPelespejoquemiente.png' :
                w.code === 'CM' ? 'MOCKUPcuandoelmañanatesecuestra.png' :
                w.code === 'ES' ? 'MOCKUPelecodelsilencio.png' :
                'MOCKUPlaultimacerteza.png'
              }" class="${isPP ? 'img-pp-framed' : 'img-standard'}" />
            </div>
            <p class="title">Seguir con esta obra</p>
          </div>
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/mockupglobal.png" class="img-standard" />
            </div>
            <p class="title">Explorar las seis obras</p>
          </div>
          <div class="col">
            <div class="img-box">
              <img src="http://localhost:3000/images/sillonterceraopcion.png" class="img-standard" />
            </div>
            <p class="title">Seguir aquí, en La Consulta</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `public/desktop_preview_${w.code}.png` });
    console.log(`Saved desktop_preview_${w.code}.png`);
  }

  await browser.close();
}

testAllWorks().catch(console.error);
