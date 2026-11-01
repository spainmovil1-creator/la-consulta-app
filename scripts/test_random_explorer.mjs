/**
 * EXPLORADOR DE RESPUESTAS PSEUDOALEATORIAS CON SEMILLA (PRNG) E INVARIANTES
 * LA CONSULTA — PRUEBA 1 (FASE B AUTORIZADA)
 *
 * Características:
 * - Generador Mulberry32 con semilla determinista reproducible.
 * - Registro estructurado de ejecuciones.
 * - Validación de los 8 invariantes matemáticos del motor en cada ejecución.
 * - Demostración de reproducibilidad idéntica al reutilizar la semilla.
 * - Ejecución 100% aislada en memoria sin interactuar con almacenamiento persistente.
 */

import {
  calculateWinningWork,
  ALL_WORK_CODES,
} from '../engine/selectionEngine.ts';

const QUESTION_IDS = [
  'P01', 'P02', 'P03', 'P04', 'P05',
  'P06', 'P07', 'P08', 'P09', 'P10',
  'P11', 'P12', 'P13', 'P14', 'P15',
];
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/**
 * Generador pseudoaleatorio Mulberry32 (32-bit PRNG determinista basado en semilla)
 */
function createPrng(seed) {
  let s = Math.trunc(seed) >>> 0;
  return function nextFloat() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateRandomAnswers(prng) {
  const answers = {};
  for (const qId of QUESTION_IDS) {
    const optIndex = Math.floor(prng() * OPTION_KEYS.length);
    answers[qId] = OPTION_KEYS[optIndex];
  }
  return answers;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FALLO: ${message}`);
  }
}

console.log('================================================================');
console.log('PRUEBA 1: EXPLORACIÓN PSEUDOALEATORIA CON SEMILLA E INVARIANTES');
console.log('================================================================');

// Obtener semilla desde argumento CLI o usar semilla canónica fija
const argSeed = process.argv.find((arg) => arg.startsWith('--seed='));
const SEED = argSeed ? parseInt(argSeed.split('=')[1], 10) : 42891;
const ITERATIONS = 100;

console.log(`Configuración: Semilla = ${SEED}, Iteraciones = ${ITERATIONS}`);

const prng1 = createPrng(SEED);
const resultsRun1 = [];

let allInvariantsPassed = true;
let invariantFailures = [];

for (let i = 0; i < ITERATIONS; i++) {
  const answers = generateRandomAnswers(prng1);
  const result = calculateWinningWork(answers, undefined, (tied) => tied[Math.floor(prng1() * tied.length)]);

  resultsRun1.push({
    iteration: i + 1,
    answers,
    scores: result.scores,
    winningWork: result.winningWork,
    tiedWorks: result.tiedWorks,
  });

  const scoresList = Object.values(result.scores);
  const sumScores = scoresList.reduce((a, b) => a + b, 0);
  const maxScore = Math.max(...scoresList);

  // Invariante 1: Exactamente 15 respuestas procesadas
  if (result.totalAnswersProcessed !== 15) {
    allInvariantsPassed = false;
    invariantFailures.push(`Iteración ${i + 1}: totalAnswersProcessed (${result.totalAnswersProcessed}) !== 15`);
  }

  // Invariante 2: Suma de puntuaciones es exactamente 15
  if (sumScores !== 15) {
    allInvariantsPassed = false;
    invariantFailures.push(`Iteración ${i + 1}: suma de puntuaciones (${sumScores}) !== 15`);
  }

  // Invariante 3: Todas las puntuaciones están entre 0 y 15
  for (const code of ALL_WORK_CODES) {
    const s = result.scores[code];
    if (typeof s !== 'number' || s < 0 || s > 15 || !Number.isInteger(s)) {
      allInvariantsPassed = false;
      invariantFailures.push(`Iteración ${i + 1}: puntuación de ${code} inválida (${s})`);
    }
  }

  // Invariante 4: Obra ganadora pertenece al catálogo canónico
  if (!ALL_WORK_CODES.includes(result.winningWork)) {
    allInvariantsPassed = false;
    invariantFailures.push(`Iteración ${i + 1}: obra ganadora no canónica (${result.winningWork})`);
  }

  // Invariante 5: La puntuación de la obra ganadora coincide con la puntuación máxima
  if (result.scores[result.winningWork] !== maxScore) {
    allInvariantsPassed = false;
    invariantFailures.push(
      `Iteración ${i + 1}: puntuación de ganadora ${result.winningWork} (${result.scores[result.winningWork]}) !== maxScore (${maxScore})`
    );
  }

  // Invariante 6: Todas las obras en tiedWorks tienen exactamente maxScore
  for (const tiedCode of result.tiedWorks) {
    if (result.scores[tiedCode] !== maxScore) {
      allInvariantsPassed = false;
      invariantFailures.push(`Iteración ${i + 1}: obra empatada ${tiedCode} tiene puntuación distinta a maxScore`);
    }
  }

  // Invariante 7: Ninguna obra fuera de tiedWorks tiene maxScore
  for (const code of ALL_WORK_CODES) {
    if (!result.tiedWorks.includes(code) && result.scores[code] >= maxScore) {
      allInvariantsPassed = false;
      invariantFailures.push(`Iteración ${i + 1}: obra no empatada ${code} tiene puntuación >= maxScore`);
    }
  }

  // Invariante 8: La obra ganadora es miembro estricto de tiedWorks
  if (!result.tiedWorks.includes(result.winningWork)) {
    allInvariantsPassed = false;
    invariantFailures.push(`Iteración ${i + 1}: ganadora ${result.winningWork} no pertenece a tiedWorks`);
  }
}

assert(allInvariantsPassed, `Los 8 invariantes matemáticos se cumplen en el 100% de las ${ITERATIONS} ejecuciones exploradas`);
if (!allInvariantsPassed) {
  console.error('Fallas de invariantes registradas:', invariantFailures.slice(0, 5));
}

// Comprobación de determinismo y reproducibilidad con la misma semilla
console.log('\nComprobando reproducibilidad determinista reejecutando con la misma semilla:');
const prng2 = createPrng(SEED);
let reproducibilityExact = true;

for (let i = 0; i < ITERATIONS; i++) {
  const answersRun2 = generateRandomAnswers(prng2);
  const resultRun2 = calculateWinningWork(answersRun2, undefined, (tied) => tied[Math.floor(prng2() * tied.length)]);

  const prev = resultsRun1[i];
  if (
    JSON.stringify(answersRun2) !== JSON.stringify(prev.answers) ||
    JSON.stringify(resultRun2.scores) !== JSON.stringify(prev.scores) ||
    resultRun2.winningWork !== prev.winningWork
  ) {
    reproducibilityExact = false;
    console.error(`Discrepancia en iteración ${i + 1} de reejecución`);
  }
}

assert(reproducibilityExact, `Reejecutar con semilla ${SEED} produce idéntico vector de respuestas, puntuaciones y ganadores en las ${ITERATIONS} iteraciones`);

// Muestra estadística de cobertura de las 6 obras en el conjunto explorado
const winDistribution = {};
for (const code of ALL_WORK_CODES) {
  winDistribution[code] = 0;
}
for (const r of resultsRun1) {
  winDistribution[r.winningWork] = (winDistribution[r.winningWork] || 0) + 1;
}

console.log('\nDistribución de obras ganadoras en la muestra explorada (100 iteraciones):');
for (const code of ALL_WORK_CODES) {
  console.log(`  - ${code} (${rpad(code, 3)}): ${winDistribution[code]} victorias`);
}
const allWorksAppearedAtLeastOnce = ALL_WORK_CODES.every((c) => winDistribution[c] > 0);
assert(
  allWorksAppearedAtLeastOnce,
  'Las seis obras canónicas (DD, PP, EM, CM, ES, UC) resultaron ganadoras al menos una vez en la exploración pseudoaleatoria'
);

function rpad(str, len) {
  return (str + '   ').slice(0, len);
}

console.log('\n================================================================');
console.log(`RESUMEN PRUEBA 1: ${passedTests}/${totalTests} superadas. Fallos: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
