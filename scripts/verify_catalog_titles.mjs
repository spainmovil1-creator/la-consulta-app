import fs from 'node:fs';
import path from 'node:path';
import { WORKS_CARDS_MAP } from '../content/cards.ts';
import { ALL_WORK_CODES } from '../engine/selectionEngine.ts';

const txtPath = path.resolve('public/assets/aistudio/La_Consulta_29_cartas_pendientes_corregidas_415b4dd8.txt');
const text = fs.readFileSync(txtPath, 'utf-8');

const blocks = text.split(/={30,}/);
const sourceCards = new Map();

// Carta 1 PP.1 (fuente: Documento Maestro Canon Elena Vargas)
sourceCards.set('PP.1', {
  workCode: 'PP',
  cardNumber: 1,
  globalNumber: 1,
  canonId: 'PP.1',
  title: 'Cuando termina el día, pero no termina',
});

// Mapeo canónico de las 29 cartas del TXT
for (const b of blocks.slice(1)) {
  const trimmed = b.trim();
  if (!trimmed) continue;
  const match = trimmed.match(/\[([A-Z0-9\.]+)\]\s*CARTA\s*(\d+)\s*[—–-]\s*(.+)/);
  if (match) {
    let rawTag = match[1].trim();
    const globalNumber = parseInt(match[2], 10);
    const title = match[3].trim();

    // Las cuatro primeras cartas en el TXT llevan metadato [P02]..[P05], correspondientes canónicamente a PP.2..PP.5
    let canonId = rawTag;
    if (rawTag === 'P02') canonId = 'PP.2';
    else if (rawTag === 'P03') canonId = 'PP.3';
    else if (rawTag === 'P04') canonId = 'PP.4';
    else if (rawTag === 'P05') canonId = 'PP.5';

    const [workCode, numStr] = canonId.split('.');
    const cardNumber = parseInt(numStr, 10);
    sourceCards.set(canonId, {
      rawTag,
      workCode,
      cardNumber,
      globalNumber,
      canonId,
      title,
    });
  }
}

console.log(`[Fuente Editorial] Cargadas ${sourceCards.size} cartas de referencia (Carta 1 + 29 del TXT)`);

let totalChecked = 0;
let errors = 0;

for (const workCode of ALL_WORK_CODES) {
  for (let cNum = 1; cNum <= 5; cNum++) {
    totalChecked++;
    const canonId = `${workCode}.${cNum}`;
    const source = sourceCards.get(canonId);
    if (!source) {
      console.error(`✗ Error: No se encontró referencia editorial para ${canonId}`);
      errors++;
      continue;
    }

    const card = WORKS_CARDS_MAP[workCode]?.[cNum];
    if (!card) {
      console.error(`✗ Error: En catálogo no existe carta para ${canonId}`);
      errors++;
      continue;
    }

    const titleMatch = card.title === source.title;
    const workMatch = card.workCode === source.workCode;
    const numMatch = card.cardNumber === source.cardNumber;

    if (!titleMatch || !workMatch || !numMatch) {
      console.error(`✗ Discrepancia en ${canonId}:`);
      if (!titleMatch) console.error(`   Título: catálogo="${card.title}" vs fuente="${source.title}"`);
      if (!workMatch) console.error(`   Obra: catálogo="${card.workCode}" vs fuente="${source.workCode}"`);
      if (!numMatch) console.error(`   Posición: catálogo="${card.cardNumber}" vs fuente="${source.cardNumber}"`);
      errors++;
    } else {
      console.log(`  ✓ Carta ${source.globalNumber.toString().padStart(2, ' ')} [${canonId}] (Posición ${cNum}/5 de ${workCode}) -> Título exacto: «${card.title}»`);
    }
  }
}

console.log(`\n======================================================`);
console.log(`RESULTADO VERIFICACIÓN DE TÍTULOS Y POSICIONES:`);
console.log(`Total verificadas: ${totalChecked}`);
console.log(`Coincidencias exactas: ${totalChecked - errors}`);
console.log(`Discrepancias: ${errors}`);
console.log(`======================================================`);

if (errors > 0) process.exit(1);
