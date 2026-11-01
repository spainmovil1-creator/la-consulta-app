const fs = require('fs');
const path = require('path');

const files = [
  'MOCKUPeldiaquedejedeser.png',
  'MOCKUPelpesoquenoseve.PNG',
  'MOCKUPelespejoquemiente.png',
  'MOCKUPcuandoelmañanatesecuestra.png',
  'MOCKUPelecodelsilencio.png',
  'MOCKUPlaultimacerteza.png',
  'mockupglobal.png',
  'sillonterceraopcion.png'
];

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height, ratio: (width/height).toFixed(3) };
}

files.forEach(function(f) {
  const p = path.join('public/images', f);
  if (fs.existsSync(p)) {
    const dim = getPngDimensions(p);
    console.log(f + ': ' + dim.width + ' x ' + dim.height + ' px (proporción W:H = ' + dim.ratio + ')');
  } else {
    console.log('NOT FOUND: ' + f);
  }
});
