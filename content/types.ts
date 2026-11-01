/**
 * CONTENT LAYER — TYPES
 *
 * Contratos de datos editoriales desacoplados de la interfaz gráfica.
 * Fuente: Canon 2.0 y Especificación Técnica La Consulta.
 */

export type QuestionType = "scene" | "direct";

export type OptionLetter = "A" | "B" | "C" | "D";

export type OptionValue = 1 | 2 | 3 | 4;

export interface OptionDefinition {
  id: string;
  letter: OptionLetter;
  text: string;
  value: OptionValue;
}

export interface QuestionDefinition {
  id: string;
  order: number;
  type: QuestionType;
  imageId: string;
  text: string;
  options: OptionDefinition[];
}

export interface WorkDefinition {
  id: string;
  order: number;
  slug: string;
  title: string;
  description: string;
  doorImage?: string;
  heroImage?: string;
}
