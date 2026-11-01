/**
 * STATE LAYER — TYPES
 *
 * Definición del estado de sesión y recorrido de La Consulta.
 * Preparado para persistencia local desacoplada (localStorage/IndexedDB) y futura API.
 */

import type { RecognitionResult } from '@/engine/types';

export type FlowPhase =
  | 'intro'
  | 'vestibulo'
  | 'consulta'
  | 'resultado'
  | 'carta'
  | 'obra';

export interface UserAnswer {
  questionId: string;
  optionId: string;
  value: 1 | 2 | 3 | 4;
  timestamp: string;
}

export interface ConsultationSession {
  consultationId: string;
  currentPhase: FlowPhase;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  startedAt: string;
  completedAt?: string;
  recognitionResult?: RecognitionResult;
}
