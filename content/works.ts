/**
 * CANON ELENA VARGAS 2.0 — LAS SEIS OBRAS DE LA CASA
 *
 * Título I, Artículo 3:
 * 1. El peso que no se ve
 * 2. El espejo que miente
 * 3. El eco del silencio
 * 4. El día que dejé de ser
 * 5. Cuando el mañana te secuestra
 * 6. La única certeza
 */

import type { WorkDefinition } from './types';

export const CANONICAL_WORKS: WorkDefinition[] = [
  {
    id: 'work-1',
    order: 1,
    slug: 'el-peso-que-no-se-ve',
    title: 'El peso que no se ve',
    description: 'Sostener y hacerse cargo de aquello que no se nombra.',
  },
  {
    id: 'work-2',
    order: 2,
    slug: 'el-espejo-que-miente',
    title: 'El espejo que miente',
    description: 'El valor propio frente a la mirada de los demás.',
  },
  {
    id: 'work-3',
    order: 3,
    slug: 'el-eco-del-silencio',
    title: 'El eco del silencio',
    description: 'Identidad, espacio propio y lo que queda en la quietud.',
  },
  {
    id: 'work-4',
    order: 4,
    slug: 'el-dia-que-deje-de-ser',
    title: 'El día que dejé de ser',
    description: 'El desvanecimiento y la reconstrucción de la vida propia.',
  },
  {
    id: 'work-5',
    order: 5,
    slug: 'cuando-el-manana-te-secuestra',
    title: 'Cuando el mañana te secuestra',
    description: 'Anticipar constantemente lo que aún no ha llegado.',
  },
  {
    id: 'work-6',
    order: 6,
    slug: 'la-unica-certeza',
    title: 'La única certeza',
    description: 'Aprender a leer señales y sostener lo que ocurre.',
  },
];
