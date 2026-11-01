/**
 * RECOGNITION ENGINE — ARCHITECTURE BOUNDARY
 *
 * Módulo desacoplado de React y de la interfaz.
 * En esta Fase 1 el motor no está implementado todavía; queda definida la firma
 * arquitectónica pública que consumirá el flujo en fases posteriores.
 */

export * from './types';
export * from './selectionEngine';
import type { EngineAnswer, RecognitionResult } from './types';

/**
 * Contrato de la función principal de reconocimiento.
 * En la fase correspondiente se implementará la canalización:
 * ANSWERS -> SIGNALS -> NORMALIZATION -> CANDIDATES -> CONCENTRATION -> DOORS
 */
export function recognizeStub(answers: EngineAnswer[]): RecognitionResult {
  // Arquitectura preparada. Motor pendiente de implementación formal en su fase dedicada.
  if (!answers || answers.length === 0) {
    return {
      status: "NO_SIGNAL",
      doors: [],
    };
  }

  return {
    status: "NOT_DISCRIMINATED",
    doors: [],
  };
}
