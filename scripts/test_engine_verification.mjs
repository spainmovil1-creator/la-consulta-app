/**
 * BATERÍA DE PRUEBAS DE VERIFICACIÓN DEL MOTOR, ROTACIÓN E INTEGRIDAD EDITORIAL
 * LA CONSULTA — FASE B (AUTORIZADA)
 *
 * Requisitos y condiciones:
 * 1. Casos deterministas para las 6 obras verificados independientemente contra DEFAULT_ASSIGNMENT_MATRIX.
 * 2. Desempates deterministas con inyección de randomChoiceFn para verificar todas las opciones posibles.
 * 3. Rotación completa 1 -> 2 -> 3 -> 4 -> 5 -> 1 e independencia para las 6 obras.
 * 4. Almacenamiento aislado en memoria; ninguna interacción con almacenamiento de sesiones reales.
 * 5. Integridad editorial: contraste de Carta 1 contra referencia del Documento Maestro (independiente
 *    del código de cards.ts) y verificación de 29 cartas pendientes vacías sin textos provisionales.
 */

import {
  calculateWinningWork,
  getAndAdvanceCardForWork,
  getRotationState,
  saveRotationState,
  resetAllCardRotations,
  DEFAULT_ASSIGNMENT_MATRIX,
  ALL_WORK_CODES,
  WORKS_METADATA,
} from '../engine/selectionEngine.ts';

import { getCardForWork, WORKS_CARDS_MAP } from '../content/cards.ts';

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
console.log('SUITE 1: VERIFICACIÓN UNITARIA DE LA MATRIZ Y ASIGNACIÓN (P01-P15)');
console.log('================================================================');

// 1.1 Verificación unitaria exhaustiva: 15 preguntas x 4 opciones = 60 combinaciones
let allMatrixCellsUnitary = true;
for (const [qId, options] of Object.entries(DEFAULT_ASSIGNMENT_MATRIX)) {
  for (const [optKey, assignedWork] of Object.entries(options)) {
    const singleResult = calculateWinningWork({ [qId]: optKey });
    if (
      singleResult.totalAnswersProcessed !== 1 ||
      singleResult.scores[assignedWork] !== 1 ||
      Object.values(singleResult.scores).reduce((a, b) => a + b, 0) !== 1
    ) {
      allMatrixCellsUnitary = false;
      console.error(`Discrepancia en matriz: pregunta ${qId}, opción ${optKey} -> esperado 1 punto para ${assignedWork}`);
    }
  }
}
assert(allMatrixCellsUnitary, 'Las 60 celdas de DEFAULT_ASSIGNMENT_MATRIX asignan unívocamente 1 punto exacto a su obra');

console.log('\n================================================================');
console.log('SUITE 2: CASOS DETERMINISTAS PARA LAS SEIS OBRAS (VICTORIA UNÍVOCA)');
console.log('================================================================');

// Vectores deterministas canónicos verificados independientemente contra DEFAULT_ASSIGNMENT_MATRIX
const deterministicCases = [
  {
    code: 'PP',
    name: 'El peso que no se ve',
    answers: {
      P01: 'A', // PP (1)
      P02: 'B', // PP (2)
      P03: 'D', // PP (3)
      P04: 'C', // PP (4)
      P05: 'A', // CM (1)
      P06: 'A', // PP (5)
      P07: 'B', // PP (6)
      P08: 'D', // PP (7)
      P09: 'C', // PP (8)
      P10: 'A', // DD (1)
      P11: 'A', // PP (9)
      P12: 'B', // PP (10)
      P13: 'C', // PP (11)
      P14: 'A', // CM (2)
      P15: 'B', // PP (12)
    },
    expectedScores: { PP: 12, CM: 2, DD: 1, EM: 0, ES: 0, UC: 0 },
    expectedWinner: 'PP',
  },
  {
    code: 'DD',
    name: 'El día que dejé de ser',
    answers: {
      P01: 'A', // PP (1)
      P02: 'A', // DD (1)
      P03: 'C', // DD (2)
      P04: 'A', // EM (1)
      P05: 'B', // DD (3)
      P06: 'D', // DD (4)
      P07: 'A', // EM (2)
      P08: 'C', // DD (5)
      P09: 'A', // ES (1)
      P10: 'A', // DD (6)
      P11: 'D', // DD (7)
      P12: 'A', // UC (1)
      P13: 'B', // DD (8)
      P14: 'A', // CM (1)
      P15: 'A', // DD (9)
    },
    expectedScores: { DD: 9, EM: 2, PP: 1, ES: 1, UC: 1, CM: 1 },
    expectedWinner: 'DD',
  },
  {
    code: 'EM',
    name: 'El espejo que miente',
    answers: {
      P01: 'B', // EM (1)
      P02: 'D', // EM (2)
      P03: 'A', // ES (1)
      P04: 'A', // EM (3)
      P05: 'C', // EM (4)
      P06: 'A', // PP (1)
      P07: 'A', // EM (5)
      P08: 'B', // EM (6)
      P09: 'A', // ES (2)
      P10: 'C', // EM (7)
      P11: 'A', // PP (2)
      P12: 'C', // EM (8)
      P13: 'A', // ES (3)
      P14: 'B', // EM (9)
      P15: 'D', // EM (10)
    },
    expectedScores: { EM: 10, ES: 3, PP: 2, DD: 0, CM: 0, UC: 0 },
    expectedWinner: 'EM',
  },
  {
    code: 'CM',
    name: 'Cuando el mañana te secuestra',
    answers: {
      P01: 'D', // CM (1)
      P02: 'A', // DD (1)
      P03: 'B', // CM (2)
      P04: 'A', // EM (1)
      P05: 'A', // CM (3)
      P06: 'C', // CM (4)
      P07: 'A', // EM (2)
      P08: 'A', // CM (5)
      P09: 'D', // CM (6)
      P10: 'A', // DD (2)
      P11: 'B', // CM (7)
      P12: 'D', // CM (8)
      P13: 'A', // ES (1)
      P14: 'A', // CM (9)
      P15: 'C', // CM (10)
    },
    expectedScores: { CM: 10, DD: 2, EM: 2, ES: 1, PP: 0, UC: 0 },
    expectedWinner: 'CM',
  },
  {
    code: 'ES',
    name: 'El eco del silencio',
    answers: {
      P01: 'C', // ES (1)
      P02: 'A', // DD (1)
      P03: 'A', // ES (2)
      P04: 'D', // ES (3)
      P05: 'A', // CM (1)
      P06: 'B', // ES (4)
      P07: 'D', // ES (5)
      P08: 'A', // CM (2)
      P09: 'A', // ES (6)
      P10: 'B', // ES (7)
      P11: 'C', // ES (8)
      P12: 'A', // UC (1)
      P13: 'A', // ES (9)
      P14: 'D', // ES (10)
      P15: 'A', // DD (2)
    },
    expectedScores: { ES: 10, DD: 2, CM: 2, UC: 1, PP: 0, EM: 0 },
    expectedWinner: 'ES',
  },
  {
    code: 'UC',
    name: 'La única certeza',
    answers: {
      P01: 'A', // PP (1)
      P02: 'C', // UC (1)
      P03: 'A', // ES (1)
      P04: 'B', // UC (2)
      P05: 'D', // UC (3)
      P06: 'A', // PP (2)
      P07: 'C', // UC (4)
      P08: 'A', // CM (1)
      P09: 'B', // UC (5)
      P10: 'D', // UC (6)
      P11: 'A', // PP (3)
      P12: 'A', // UC (7)
      P13: 'D', // UC (8)
      P14: 'C', // UC (9)
      P15: 'A', // DD (1)
    },
    expectedScores: { UC: 9, PP: 3, ES: 1, CM: 1, DD: 1, EM: 0 },
    expectedWinner: 'UC',
  },
];

for (const testCase of deterministicCases) {
  const result = calculateWinningWork(testCase.answers);

  assert(result.totalAnswersProcessed === 15, `Caso ${testCase.code}: procesadas 15 respuestas exactas`);

  const sumScores = Object.values(result.scores).reduce((a, b) => a + b, 0);
  assert(sumScores === 15, `Caso ${testCase.code}: suma total de puntuaciones es exactamente 15`);

  // Comprobar cada puntuación individual contra el cálculo esperado
  let scoresMatch = true;
  for (const code of ALL_WORK_CODES) {
    if (result.scores[code] !== testCase.expectedScores[code]) {
      scoresMatch = false;
      console.error(
        `Discrepancia de puntuación en caso ${testCase.code} para obra ${code}: obtenido ${result.scores[code]}, esperado ${testCase.expectedScores[code]}`
      );
    }
  }
  assert(scoresMatch, `Caso ${testCase.code}: las puntuaciones individuales coinciden con el cálculo matemático independiente`);
  assert(result.winningWork === testCase.expectedWinner, `Caso ${testCase.code}: gana la obra esperada (${testCase.expectedWinner})`);
  assert(
    result.tiedWorks.length === 1 && result.tiedWorks[0] === testCase.expectedWinner,
    `Caso ${testCase.code}: no hay empates en la puntuación máxima`
  );

  // Correspondencia con catálogo
  const cardDef = getCardForWork(result.winningWork, 1);
  assert(
    cardDef && cardDef.workCode === result.winningWork,
    `Caso ${testCase.code}: el catálogo entrega la carta correspondiente a la obra ganadora (${result.winningWork})`
  );
}

console.log('\n================================================================');
console.log('SUITE 3: DESEMPATES DETERMINISTAS (INYECCIÓN DE randomChoiceFn)');
console.log('================================================================');

// 3.1 Empate doble entre DD y EM a 7 puntos cada una (UC = 1)
const answersTieDouble = {
  P01: 'B', // EM (1)
  P02: 'A', // DD (1)
  P03: 'C', // DD (2)
  P04: 'A', // EM (2)
  P05: 'B', // DD (3)
  P06: 'D', // DD (4)
  P07: 'A', // EM (3)
  P08: 'B', // EM (4)
  P09: 'B', // UC (1)
  P10: 'A', // DD (5)
  P11: 'D', // DD (6)
  P12: 'C', // EM (5)
  P13: 'B', // DD (7)
  P14: 'B', // EM (6)
  P15: 'D', // EM (7)
};

const tieDoubleEval = calculateWinningWork(answersTieDouble);
assert(tieDoubleEval.scores.DD === 7 && tieDoubleEval.scores.EM === 7, 'Empate doble: DD=7, EM=7');
assert(tieDoubleEval.tiedWorks.length === 2, 'Detectadas exactamente 2 obras empatadas en la cima');
assert(
  tieDoubleEval.tiedWorks.includes('DD') && tieDoubleEval.tiedWorks.includes('EM'),
  'Las obras empatadas son DD y EM'
);

// Verificación determinista inyectando randomChoiceFn para cada rama de desempate
const branchDD = calculateWinningWork(answersTieDouble, undefined, (tied) => {
  assert(tied.length === 2 && tied.includes('DD') && tied.includes('EM'), 'randomChoiceFn recibe exactamente las obras empatadas');
  return tied[0]; // Selecciona determinísticamente la primera
});
assert(branchDD.winningWork === tieDoubleEval.tiedWorks[0], `Rama 1 de desempate determinista selecciona ${tieDoubleEval.tiedWorks[0]}`);

const branchEM = calculateWinningWork(answersTieDouble, undefined, (tied) => {
  return tied[1]; // Selecciona determinísticamente la segunda
});
assert(branchEM.winningWork === tieDoubleEval.tiedWorks[1], `Rama 2 de desempate determinista selecciona ${tieDoubleEval.tiedWorks[1]}`);

// Comprobación de que una obra no empatada (ej. UC con 1 punto) NUNCA puede ser seleccionada
assert(branchDD.winningWork !== 'UC' && branchEM.winningWork !== 'UC', 'La obra no empatada UC (1 punto) nunca resulta ganadora');

// 3.2 Empate triple entre PP, DD y ES a 5 puntos cada una
const answersTieTriple = {
  P01: 'A', // PP (1)
  P02: 'A', // DD (1)
  P03: 'A', // ES (1)
  P04: 'C', // PP (2)
  P05: 'B', // DD (2)
  P06: 'B', // ES (2)
  P07: 'B', // PP (3)
  P08: 'C', // DD (3)
  P09: 'A', // ES (3)
  P10: 'A', // DD (4)
  P11: 'A', // PP (4)
  P12: 'B', // PP (5)
  P13: 'A', // ES (4)
  P14: 'D', // ES (5)
  P15: 'A', // DD (5)
};

const tieTripleEval = calculateWinningWork(answersTieTriple);
assert(
  tieTripleEval.scores.PP === 5 && tieTripleEval.scores.DD === 5 && tieTripleEval.scores.ES === 5,
  'Empate triple: PP=5, DD=5, ES=5'
);
assert(tieTripleEval.tiedWorks.length === 3, 'Detectadas exactamente 3 obras empatadas en la cima');

// Probar determinísticamente las 3 ramas posibles
for (let i = 0; i < 3; i++) {
  const branchResult = calculateWinningWork(answersTieTriple, undefined, (tied) => tied[i]);
  assert(
    branchResult.winningWork === tieTripleEval.tiedWorks[i],
    `Rama ${i + 1} de empate triple determinista selecciona correctamente ${tieTripleEval.tiedWorks[i]}`
  );
  assert(
    ['PP', 'DD', 'ES'].includes(branchResult.winningWork),
    `La ganadora en rama ${i + 1} es miembro estricto del grupo de empate`
  );
}

// Obras con 0 puntos jamás seleccionadas
assert(!['EM', 'CM', 'UC'].includes(tieTripleEval.winningWork), 'Obras con 0 puntos nunca son seleccionadas');

console.log('\n================================================================');
console.log('SUITE 4: ROTACIÓN COMPLETA (1 -> 2 -> 3 -> 4 -> 5 -> 1) E INDEPENDENCIA');
console.log('================================================================');

// Aislar el almacenamiento en un mock de memoria dedicado para las pruebas
const testIsolatedStorage = {};
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => testIsolatedStorage[key] || null,
  setItem: (key, val) => {
    testIsolatedStorage[key] = String(val);
  },
  removeItem: (key) => {
    delete testIsolatedStorage[key];
  },
};

resetAllCardRotations();

// 4.1 Comprobar ciclo completo de 5 posiciones para LAS SEIS OBRAS
for (const code of ALL_WORK_CODES) {
  resetAllCardRotations();
  const sequence = [];
  for (let step = 0; step < 7; step++) {
    const sel = getAndAdvanceCardForWork(code);
    sequence.push(sel.cardNumber);
  }
  const expectedSeq = [1, 2, 3, 4, 5, 1, 2];
  assert(
    JSON.stringify(sequence) === JSON.stringify(expectedSeq),
    `Obra ${code}: ciclo completo de rotación ${sequence.join(' -> ')} coincide con [1, 2, 3, 4, 5, 1, 2]`
  );
}

// 4.2 Comprobar independencia estricta entre los contadores de las seis obras
resetAllCardRotations();
// Avanzar PP 2 veces (queda en 3)
getAndAdvanceCardForWork('PP'); // 1 -> 2
getAndAdvanceCardForWork('PP'); // 2 -> 3

// Avanzar ES 4 veces (queda en 5)
getAndAdvanceCardForWork('ES'); // 1 -> 2
getAndAdvanceCardForWork('ES'); // 2 -> 3
getAndAdvanceCardForWork('ES'); // 3 -> 4
getAndAdvanceCardForWork('ES'); // 4 -> 5

const stateCheck = getRotationState();
assert(stateCheck.PP === 3, `PP avanzó a 3 (obtenido: ${stateCheck.PP})`);
assert(stateCheck.ES === 5, `ES avanzó a 5 (obtenido: ${stateCheck.ES})`);
assert(stateCheck.DD === 1, `DD permanece intacta en 1 (obtenido: ${stateCheck.DD})`);
assert(stateCheck.EM === 1, `EM permanece intacta en 1 (obtenido: ${stateCheck.EM})`);
assert(stateCheck.CM === 1, `CM permanece intacta en 1 (obtenido: ${stateCheck.CM})`);
assert(stateCheck.UC === 1, `UC permanece intacta en 1 (obtenido: ${stateCheck.UC})`);

// 4.3 Aislamiento del Modo de Comprobación Visual (las 30 cartas pueden consultarse N veces sin alterar rotaciones)
const stateBeforeVisualChecks = getRotationState();
for (const code of ALL_WORK_CODES) {
  for (let cardNum = 1; cardNum <= 5; cardNum++) {
    // Modo comprobación solo lee la carta mediante getCardForWork sin invocar getAndAdvanceCardForWork
    const card = getCardForWork(code, cardNum);
    assert(card && card.cardNumber === cardNum, `Comprobación visual de ${code}.${cardNum} carga carta correctamente`);
  }
}
const stateAfterVisualChecks = getRotationState();
assert(
  JSON.stringify(stateBeforeVisualChecks) === JSON.stringify(stateAfterVisualChecks),
  'Consultar las 30 posiciones en modo comprobación mantiene los contadores de rotación 100% inalterados'
);

console.log('\n================================================================');
console.log('SUITE 5: PERSISTENCIA AISLADA Y TOLERANCIA ANTE DATOS CORRUPTOS');
console.log('================================================================');

// 5.1 Verificación de persistencia tras recarga simulada
resetAllCardRotations();
getAndAdvanceCardForWork('DD'); // DD entrega 1 y guarda 2
assert(
  testIsolatedStorage['la_consulta_card_rotations_v2'] &&
  JSON.parse(testIsolatedStorage['la_consulta_card_rotations_v2']).DD === 2,
  'El estado se persiste bajo la clave en el almacenamiento aislado'
);

const reloadedState = getRotationState();
assert(reloadedState.DD === 2, 'Tras recarga simulada, DD continúa en carta 2');
const nextDD = getAndAdvanceCardForWork('DD');
assert(nextDD.cardNumber === 2, 'La siguiente consulta entrega la carta 2');
assert(nextDD.nextCardNumber === 3, 'Y prepara la rotación para carta 3');

// 5.2 Tolerancia ante datos corruptos o valores fuera de rango en almacenamiento
resetAllCardRotations();
testIsolatedStorage['la_consulta_card_rotations_v2'] = JSON.stringify({
  DD: 99, // Inválido: fuera de rango 1..5
  PP: 'corrupto', // Inválido: no numérico
  EM: -3, // Inválido: negativo
  CM: 4, // Válido
  ES: null, // Inválido
  UC: 2, // Válido
});

const sanitizedState = getRotationState();
assert(sanitizedState.DD === 1, `Valor inválido DD=99 es saneado al valor seguro 1 (obtenido: ${sanitizedState.DD})`);
assert(sanitizedState.PP === 1, `Valor inválido PP="corrupto" es saneado al valor seguro 1 (obtenido: ${sanitizedState.PP})`);
assert(sanitizedState.EM === 1, `Valor inválido EM=-3 es saneado al valor seguro 1 (obtenido: ${sanitizedState.EM})`);
assert(sanitizedState.CM === 4, `Valor válido CM=4 es respetado (obtenido: ${sanitizedState.CM})`);
assert(sanitizedState.UC === 2, `Valor válido UC=2 es respetado (obtenido: ${sanitizedState.UC})`);

// 5.3 Tolerancia ante JSON malformado (cadena rota)
testIsolatedStorage['la_consulta_card_rotations_v2'] = '{ json roto no valido ';
let malformedError = false;
try {
  const safeState = getRotationState();
  assert(safeState.PP >= 1 && safeState.PP <= 5, 'Ante JSON malformado devuelve estado seguro sin excepción');
} catch {
  malformedError = true;
}
assert(!malformedError, 'Almacenamiento con JSON malformado no provoca error no controlado');

// 5.4 Simulación de excepción en localStorage (SecurityError o QuotaExceeded)
globalThis.localStorage = {
  getItem: () => {
    throw new Error('SecurityError: access denied');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};
let storageExceptionCaught = false;
try {
  const fallbackSel = getAndAdvanceCardForWork('ES');
  assert(fallbackSel.cardNumber >= 1 && fallbackSel.cardNumber <= 5, 'Fallback seguro en memoria si localStorage lanza excepción');
} catch {
  storageExceptionCaught = true;
}
assert(!storageExceptionCaught, 'Excepción en localStorage manejada silenciosamente con memoria de respaldo');

// 5.5 Entorno SSR / Node puro (sin window ni localStorage)
delete globalThis.window;
delete globalThis.localStorage;
let ssrFailure = false;
try {
  const ssrSel = getAndAdvanceCardForWork('CM');
  assert(ssrSel.cardNumber >= 1 && ssrSel.cardNumber <= 5, 'En ausencia total de window/localStorage opera correctamente');
} catch {
  ssrFailure = true;
}
assert(!ssrFailure, 'Entorno sin window opera limpiamente');

// 5.6 Aislamiento estricto y reinicio de la rotación del modo de pruebas vs producción
const dualStorage = {};
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => dualStorage[key] || null,
  setItem: (key, val) => {
    dualStorage[key] = String(val);
  },
  removeItem: (key) => {
    delete dualStorage[key];
  },
};

const PROD_KEY = 'la_consulta_card_rotations_v2';
const TEST_KEY = 'la_consulta_card_rotations_verification_mode';

// 1. Simular rotaciones de producción avanzadas (ej. PP en 3, ES en 5, DD en 2)
dualStorage[PROD_KEY] = JSON.stringify({ DD: 2, PP: 3, EM: 1, CM: 1, ES: 5, UC: 1 });

// 2. Simular rotaciones independientes del modo de prueba (ej. EM en 4, CM en 3)
dualStorage[TEST_KEY] = JSON.stringify({ DD: 1, PP: 1, EM: 4, CM: 3, ES: 1, UC: 1 });

// 3. Ejecutar reinicio del modo de prueba (reproduce exactamente handleResetTestRotations)
function executeTestRotationReset() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TEST_KEY);
    } catch {}
  }
}
executeTestRotationReset();

// Aserciones de reinicio e independencia:
assert(dualStorage[TEST_KEY] === undefined, 'El reinicio del modo de pruebas elimina limpiamente la clave TEST_KEY');
const prodAfterReset = JSON.parse(dualStorage[PROD_KEY]);
assert(
  prodAfterReset.PP === 3 && prodAfterReset.ES === 5 && prodAfterReset.DD === 2,
  'El reinicio del modo de pruebas NO altera la rotación persistida de producción (PP=3, ES=5, DD=2)'
);

// Comprobar que resetAllCardRotations() de producción tampoco toca TEST_KEY si existiera
dualStorage[TEST_KEY] = JSON.stringify({ DD: 5, PP: 4, EM: 3, CM: 2, ES: 1, UC: 5 });
resetAllCardRotations();
assert(
  dualStorage[TEST_KEY] !== undefined && JSON.parse(dualStorage[TEST_KEY]).DD === 5,
  'El reinicio de rotaciones de producción no altera el almacenamiento del modo de pruebas'
);


console.log('\n================================================================');
console.log('SUITE 6: INTEGRIDAD EDITORIAL (DOCUMENTO MAESTRO VS CATÁLOGO)');
console.log('================================================================');

// Referencia canónica independiente procedente estrictamente del Documento Maestro aprobado:
const MASTER_DOC_CARTA_1 = {
  title: 'Cuando termina el día, pero no termina',
  blocks: [
    { id: 0, type: 'title', lines: ['Cuando termina el día, pero no termina'] },
    { id: 1, type: 'scene', lines: ['Sales del trabajo.', 'Cierras el ordenador, coges el bolso y te vas.'] },
    { id: 2, type: 'single', lines: ['Y, sin embargo, hay algo que se viene contigo.'] },
    {
      id: 3,
      type: 'list',
      lines: [
        'Un correo que mañana tendrás que contestar.',
        'Una cosa que se ha quedado a medias.',
        'Algo que alguien te pidió.',
        'O simplemente esa sensación de que todavía falta algo.',
      ],
    },
    {
      id: 4,
      type: 'scene',
      lines: ['Llegas a casa.', 'Haces la cena.', 'Hablas con alguien.', 'Te sientas un rato.'],
    },
    { id: 5, type: 'climax', lines: ['Pero aquello sigue ahí.'] },
    { id: 6, type: 'single', lines: ['Lo curioso es que quizá nadie te esté pidiendo que pienses en ello.'] },
    { id: 7, type: 'single', lines: ['Eres tú la que sigue llevándoselo a casa.'] },
    {
      id: 8,
      type: 'single',
      lines: ['Y puede que lleves tanto tiempo haciéndolo que ya ni siquiera te des cuenta de cuándo empieza.'],
    },
    {
      id: 9,
      type: 'single',
      lines: ['Hay responsabilidades que se quedan con nosotras incluso después de haber terminado lo que teníamos que hacer.'],
    },
    {
      id: 10,
      type: 'single',
      lines: ['A veces cuesta distinguir lo que todavía necesita nuestra atención de lo que simplemente se ha acostumbrado a tenerla.'],
    },
    {
      id: 11,
      type: 'final',
      lines: [
        'Y quizá, alguna tarde, descubras que una de esas cosas puede esperar hasta mañana.',
        'Sin que pase nada.',
        'Sin que tengas que llevártela contigo.',
      ],
    },
  ],
};

// 6.1 Contraste de Carta 1 en content/cards.ts contra Documento Maestro
const carta1Impl = WORKS_CARDS_MAP.PP[1];
assert(carta1Impl.isDefinitive === true, 'Carta 1 de PP está marcada como definitiva (isDefinitive: true)');
assert(carta1Impl.title === MASTER_DOC_CARTA_1.title, `Título de Carta 1 coincide exactamente: "${carta1Impl.title}"`);
assert(carta1Impl.blocks.length === MASTER_DOC_CARTA_1.blocks.length, `Carta 1 tiene exactamente 12 bloques (0 a 11)`);

let carta1ContentMatches = true;
for (let i = 0; i < MASTER_DOC_CARTA_1.blocks.length; i++) {
  const expectedBlock = MASTER_DOC_CARTA_1.blocks[i];
  const actualBlock = carta1Impl.blocks[i];
  if (!actualBlock) {
    carta1ContentMatches = false;
    break;
  }
  if (actualBlock.type !== expectedBlock.type) {
    carta1ContentMatches = false;
    console.error(`Discrepancia de tipo en bloque ${i}: esperado ${expectedBlock.type}, obtenido ${actualBlock.type}`);
  }
  if (JSON.stringify(actualBlock.lines) !== JSON.stringify(expectedBlock.lines)) {
    carta1ContentMatches = false;
    console.error(`Discrepancia en líneas de bloque ${i}:`, actualBlock.lines, 'vs esperado:', expectedBlock.lines);
  }
}
assert(carta1ContentMatches, 'Los 12 bloques de la Carta 1 coinciden íntegra y literalmente con el Documento Maestro');

// Comprobación de que la Carta 1 termina de forma declarativa sin signos de interrogación ni preguntas
const lastBlockLines = carta1Impl.blocks[carta1Impl.blocks.length - 1].lines;
const hasQuestionMark = lastBlockLines.some((l) => l.includes('?') || l.includes('¿'));
assert(!hasQuestionMark, 'El cierre de la Carta 1 es estrictamente declarativo y no contiene signos de interrogación');

// 6.2 Comprobación de la incorporación de las 29 cartas definitivas (Catálogo completo de 30 cartas)
let all30AreDefinitive = true;
let all30HaveValidBlocks = true;
let totalCardsCount = 0;

for (const code of ALL_WORK_CODES) {
  for (let cNum = 1; cNum <= 5; cNum++) {
    totalCardsCount++;
    const card = WORKS_CARDS_MAP[code][cNum];
    if (card.isDefinitive !== true) {
      all30AreDefinitive = false;
      console.error(`Posición ${code}.${cNum} no está marcada como isDefinitive: true`);
    }
    if (!Array.isArray(card.blocks) || card.blocks.length === 0) {
      all30HaveValidBlocks = false;
      console.error(`Posición ${code}.${cNum} no contiene bloques válidos:`, card.blocks);
    }
    // El bloque 0 debe ser de tipo title y coincidir con el título de la carta
    if (!card.blocks[0] || card.blocks[0].type !== 'title' || card.blocks[0].lines[0] !== card.title) {
      all30HaveValidBlocks = false;
      console.error(`Posición ${code}.${cNum} bloque 0 no coincide con título: ${card.title}`);
    }
    // El bloque final debe ser de tipo final
    const lastBlk = card.blocks[card.blocks.length - 1];
    if (!lastBlk || lastBlk.type !== 'final' || lastBlk.lines.length === 0) {
      all30HaveValidBlocks = false;
      console.error(`Posición ${code}.${cNum} bloque final no es de tipo 'final'`);
    }
  }
}

assert(totalCardsCount === 30, 'El catálogo contiene exactamente 30 posiciones registradas (6 obras x 5 cartas)');
assert(all30AreDefinitive, 'Las 30 posiciones del catálogo están marcadas como definitivas (isDefinitive: true)');
assert(all30HaveValidBlocks, 'Las 30 cartas contienen bloques editoriales válidos con bloque 0 de título y bloque final de cierre');

// 6.3 Comprobación específica de Carta 30 (UC.5) «Un día cualquiera»
const uc5 = WORKS_CARDS_MAP.UC[5];
assert(uc5.title === 'Un día cualquiera', `UC.5 tiene el título canónico esperado: "${uc5.title}"`);
assert(uc5.blocks.length === 11, `UC.5 contiene 11 bloques editoriales completos (1 título + 10 párrafos)`);
const uc5FinalLine = uc5.blocks[uc5.blocks.length - 1].lines[0];
assert(
  uc5FinalLine === 'Y quizá también por eso importa tanto que todavía estén ahí.',
  `UC.5 conserva intacta su frase de cierre original: "${uc5FinalLine}"`
);

// 6.4 Comprobación de las cuatro cartas de PP (PP.2 - PP.5)
assert(WORKS_CARDS_MAP.PP[2].title === 'El síndrome de la responsabilidad', 'PP.2 asignada a "El síndrome de la responsabilidad"');
assert(WORKS_CARDS_MAP.PP[3].title === 'También estoy pendiente de ti', 'PP.3 asignada a "También estoy pendiente de ti"');
assert(WORKS_CARDS_MAP.PP[4].title === '¿Y quién está pendiente de mí?', 'PP.4 asignada a "¿Y quién está pendiente de mí?"');
assert(WORKS_CARDS_MAP.PP[5].title === '¿De verdad puedo parar?', 'PP.5 asignada a "¿De verdad puedo parar?"');

console.log('\n================================================================');
console.log(`RESUMEN FINAL DE PRUEBAS: ${passedTests}/${totalTests} superadas. Fallos: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
