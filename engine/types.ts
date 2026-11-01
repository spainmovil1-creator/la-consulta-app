/**
 * RECOGNITION ENGINE — TYPES
 *
 * Contratos de tipos del Recognition Engine de La Consulta.
 * La lógica del motor debe permanecer estrictamente desacoplada de React y de la UI.
 *
 * Fuente de verdad: Documento "RECOGNITION ENGINE — CONSULTA GLOBAL"
 */

export type ConversationId = "C1" | "C2" | "C3" | "C4" | "C5";

export type Door = ConversationId;

export type RecognitionStatus =
  | "NO_SIGNAL"
  | "ONE_DOOR"
  | "TWO_DOORS"
  | "NOT_DISCRIMINATED";

export interface RecognitionResult {
  status: RecognitionStatus;
  doors: Door[];
}

export type OptionValue = 1 | 2 | 3 | 4;

export type SignalValue = 0 | 1 | 2;

export interface EngineAnswer {
  questionId: string;
  value: OptionValue;
}

export interface ConversationSignalSummary {
  conversationId: ConversationId;
  rawSignal: number;
  maxSignal: number;
  normalizedSignal: number;
  isCandidate: boolean;
}
