/**
 * MOTOR DE SELECCIÓN Y ROTACIÓN DE CARTAS — LA CONSULTA
 * 
 * Reglas de negocio:
 * 1. 6 obras canónicas con claves:
 *    - DD: El día que dejé de ser
 *    - PP: El peso que no se ve
 *    - EM: El espejo que miente
 *    - CM: Cuando el mañana te secuestra
 *    - ES: El eco del silencio
 *    - UC: La única certeza
 * 
 * 2. Cálculo:
 *    - Se leen las 15 respuestas seleccionadas (P01–P15).
 *    - Cada respuesta aporta exactamente 1 punto a la obra asignada en la matriz.
 *    - Gana la obra con la puntuación total más alta.
 *    - Los empates en la puntuación máxima se resuelven aleatoriamente entre las empatadas.
 * 
 * 3. Rotación de cartas:
 *    - Cada obra dispone de 5 cartas numeradas del 1 al 5.
 *    - Primera selección: carta 1.
 *    - Siguientes selecciones: avanza a la siguiente (1 -> 2 -> 3 -> 4 -> 5 -> 1).
 *    - Las 6 obras mantienen rotaciones independientes.
 *    - Estado persistido en almacenamiento local para conservarlo entre sesiones.
 */

export type WorkCode = 'DD' | 'PP' | 'EM' | 'CM' | 'ES' | 'UC';
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface WorkMeta {
  code: WorkCode;
  title: string;
  slug: string;
  description: string;
}

export const WORKS_METADATA: Record<WorkCode, WorkMeta> = {
  DD: {
    code: 'DD',
    title: 'El día que dejé de ser',
    slug: 'el-dia-que-deje-de-ser',
    description: 'El desvanecimiento y la reconstrucción de la vida propia.',
  },
  PP: {
    code: 'PP',
    title: 'El peso que no se ve',
    slug: 'el-peso-que-no-se-ve',
    description: 'Sostener y hacerse cargo de aquello que no se nombra.',
  },
  EM: {
    code: 'EM',
    title: 'El espejo que miente',
    slug: 'el-espejo-que-miente',
    description: 'El valor propio frente a la mirada de los demás.',
  },
  CM: {
    code: 'CM',
    title: 'Cuando el mañana te secuestra',
    slug: 'cuando-el-manana-te-secuestra',
    description: 'Anticipar constantemente lo que aún no ha llegado.',
  },
  ES: {
    code: 'ES',
    title: 'El eco del silencio',
    slug: 'el-eco-del-silencio',
    description: 'Identidad, espacio propio y lo que queda en la quietud.',
  },
  UC: {
    code: 'UC',
    title: 'La única certeza',
    slug: 'la-unica-certeza',
    description: 'Aprender a leer señales y sostener lo que ocurre.',
  },
};

export const ALL_WORK_CODES: WorkCode[] = ['DD', 'PP', 'EM', 'CM', 'ES', 'UC'];

/**
 * Matriz P01–P15 de asignación de respuestas A, B, C, D a las 6 obras.
 * Cada celda asigna de forma unívoca una obra a una opción de respuesta.
 */
export type AssignmentMatrix = Record<string, Record<OptionKey, WorkCode>>;

/**
 * Matriz canónica inicial de asignación.
 * Estructura estándar equilibrada entre las 6 obras editoriales de Elena Vargas:
 * DD, PP, EM, CM, ES, UC.
 */
export const DEFAULT_ASSIGNMENT_MATRIX: AssignmentMatrix = {
  P01: { A: 'PP', B: 'EM', C: 'ES', D: 'CM' },
  P02: { A: 'DD', B: 'PP', C: 'UC', D: 'EM' },
  P03: { A: 'ES', B: 'CM', C: 'DD', D: 'PP' },
  P04: { A: 'EM', B: 'UC', C: 'PP', D: 'ES' },
  P05: { A: 'CM', B: 'DD', C: 'EM', D: 'UC' },
  P06: { A: 'PP', B: 'ES', C: 'CM', D: 'DD' },
  P07: { A: 'EM', B: 'PP', C: 'UC', D: 'ES' },
  P08: { A: 'CM', B: 'EM', C: 'DD', D: 'PP' },
  P09: { A: 'ES', B: 'UC', C: 'PP', D: 'CM' },
  P10: { A: 'DD', B: 'ES', C: 'EM', D: 'UC' },
  P11: { A: 'PP', B: 'CM', C: 'ES', D: 'DD' },
  P12: { A: 'UC', B: 'PP', C: 'EM', D: 'CM' },
  P13: { A: 'ES', B: 'DD', C: 'PP', D: 'UC' },
  P14: { A: 'CM', B: 'EM', C: 'UC', D: 'ES' },
  P15: { A: 'DD', B: 'PP', C: 'CM', D: 'EM' },
};

export interface SelectionScoreResult {
  winningWork: WorkCode;
  scores: Record<WorkCode, number>;
  tiedWorks: WorkCode[];
  totalAnswersProcessed: number;
}

/**
 * Realiza el cómputo de puntuación sobre las respuestas recibidas.
 * - Cada respuesta aporta exactamente 1 punto a la obra designada en la matriz.
 * - Selecciona la obra con la puntuación total más alta.
 * - Si varias obras empatan en la puntuación máxima, elige una al azar entre las empatadas.
 */
export function calculateWinningWork(
  answers: Record<string, OptionKey> | Array<{ questionId: string; key: OptionKey }>,
  matrix: AssignmentMatrix = DEFAULT_ASSIGNMENT_MATRIX,
  randomChoiceFn: (tied: WorkCode[]) => WorkCode = (tied) => tied[Math.floor(Math.random() * tied.length)]
): SelectionScoreResult {
  // Inicializar puntuaciones en 0 para las 6 obras
  const scores: Record<WorkCode, number> = {
    DD: 0,
    PP: 0,
    EM: 0,
    CM: 0,
    ES: 0,
    UC: 0,
  };

  // Normalizar respuestas a pares { questionId, key }
  const answerEntries: Array<{ questionId: string; key: OptionKey }> = Array.isArray(answers)
    ? answers
    : Object.entries(answers).map(([qId, key]) => ({ questionId: qId, key }));

  let processedCount = 0;

  for (const entry of answerEntries) {
    const qMatrix = matrix[entry.questionId];
    if (qMatrix && entry.key in qMatrix) {
      const assignedWork = qMatrix[entry.key];
      if (assignedWork && assignedWork in scores) {
        scores[assignedWork] += 1;
        processedCount += 1;
      }
    }
  }

  // Hallar la puntuación máxima
  let maxScore = -1;
  for (const code of ALL_WORK_CODES) {
    if (scores[code] > maxScore) {
      maxScore = scores[code];
    }
  }

  // Identificar obras empatadas en la puntuación máxima
  const tiedWorks = ALL_WORK_CODES.filter((code) => scores[code] === maxScore);

  // Selección: obra única o resolución al azar equiprobable entre las empatadas
  const winningWork = tiedWorks.length === 1
    ? tiedWorks[0]
    : randomChoiceFn(tiedWorks);

  return {
    winningWork,
    scores,
    tiedWorks,
    totalAnswersProcessed: processedCount,
  };
}

// Clave de almacenamiento en localStorage para conservar las rotaciones independientes
const ROTATION_STORAGE_KEY = 'la_consulta_card_rotations_v2';

export type RotationState = Record<WorkCode, number>;

// Estado en memoria de respaldo si localStorage no está disponible
let memoryRotationState: RotationState = {
  DD: 1,
  PP: 1,
  EM: 1,
  CM: 1,
  ES: 1,
  UC: 1,
};

/**
 * Carga el estado actual de rotaciones de las 6 obras desde almacenamiento persistente.
 */
export function getRotationState(): RotationState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ROTATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar que contiene las 6 obras con valores del 1 al 5
        const validState: RotationState = { ...memoryRotationState };
        for (const code of ALL_WORK_CODES) {
          const val = Number(parsed[code]);
          if (val >= 1 && val <= 5) {
            validState[code] = val;
          }
        }
        memoryRotationState = validState;
        return validState;
      }
    } catch {
      // Ignorar fallo de almacenamiento
    }
  }
  return { ...memoryRotationState };
}

/**
 * Guarda el estado de rotaciones en almacenamiento persistente y memoria.
 */
export function saveRotationState(state: RotationState): void {
  memoryRotationState = { ...state };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorar fallo de almacenamiento
    }
  }
}

/**
 * Obtiene la carta actual para la obra seleccionada y avanza su rotación de forma persistente.
 * 
 * Regla:
 * - Primera selección: carta 1.
 * - Siguientes selecciones: siguiente carta (1 -> 2 -> 3 -> 4 -> 5 -> 1).
 * - Rotaciones independientes por obra.
 * - Persistencia entre sesiones.
 * 
 * Retorna el número de carta que debe mostrarse en esta consulta (1 a 5).
 */
export function getAndAdvanceCardForWork(workCode: WorkCode): {
  cardNumber: number;
  nextCardNumber: number;
  work: WorkMeta;
} {
  const currentState = getRotationState();
  const currentCard = currentState[workCode] || 1;

  // Ciclo 1 al 5: 1 -> 2 -> 3 -> 4 -> 5 -> 1
  const nextCard = currentCard >= 5 ? 1 : currentCard + 1;

  // Actualizar estado preservando las demás obras
  const newState: RotationState = {
    ...currentState,
    [workCode]: nextCard,
  };
  saveRotationState(newState);

  return {
    cardNumber: currentCard,
    nextCardNumber: nextCard,
    work: WORKS_METADATA[workCode],
  };
}

/**
 * Reinicia las rotaciones a la carta 1 para todas las obras (útil para pruebas y reinicios de experiencia).
 */
export function resetAllCardRotations(): void {
  const resetState: RotationState = {
    DD: 1,
    PP: 1,
    EM: 1,
    CM: 1,
    ES: 1,
    UC: 1,
  };
  saveRotationState(resetState);
}
