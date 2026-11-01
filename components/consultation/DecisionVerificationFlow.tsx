'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Compass,
  Play,
  Sparkles,
  Clock,
  ChevronRight,
  Eye,
  Zap,
} from 'lucide-react';
import type { WorkCode, OptionKey } from '@/engine';
import {
  calculateWinningWork,
  ALL_WORK_CODES,
  WORKS_METADATA,
  DEFAULT_ASSIGNMENT_MATRIX,
  SelectionScoreResult,
} from '@/engine';
import { QuestionScreen, AnswerRegistration } from '@/components/consultation/QuestionScreen';
import { PostP15Flow } from '@/components/consultation/PostConsultationFlow';
import { getCardForWork } from '@/content/cards';

const TEST_ROTATION_STORAGE_KEY = 'la_consulta_card_rotations_verification_mode';

const QUESTION_SEQUENCE: Array<'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06' | 'P07' | 'P08' | 'P09' | 'P10' | 'P11' | 'P12' | 'P13' | 'P14' | 'P15'> = [
  'P01', 'P02', 'P03', 'P04', 'P05',
  'P06', 'P07', 'P08', 'P09', 'P10',
  'P11', 'P12', 'P13', 'P14', 'P15',
];

export interface DecisionProfile {
  id: string;
  name: string;
  targetWorkTitle: string;
  description: string;
  expectedWinner: WorkCode | WorkCode[];
  answers: Record<string, OptionKey> | null; // null para consulta manual
  expectedScores?: Record<WorkCode, number>;
}

export const CANONICAL_DECISION_PROFILES: DecisionProfile[] = [
  {
    id: 'D-PP',
    name: 'Perfil D-PP · El peso que no se ve',
    targetWorkTitle: 'El peso que no se ve',
    description: '12 respuestas orientadas a PP. Victoria unívoca prevista con 12 puntos.',
    expectedWinner: 'PP',
    answers: {
      P01: 'A', P02: 'B', P03: 'D', P04: 'C', P05: 'A',
      P06: 'A', P07: 'B', P08: 'D', P09: 'C', P10: 'A',
      P11: 'A', P12: 'B', P13: 'C', P14: 'A', P15: 'B',
    },
    expectedScores: { PP: 12, CM: 2, DD: 1, EM: 0, ES: 0, UC: 0 },
  },
  {
    id: 'D-DD',
    name: 'Perfil D-DD · El día que dejé de ser',
    targetWorkTitle: 'El día que dejé de ser',
    description: '9 respuestas orientadas a DD. Victoria unívoca prevista con 9 puntos.',
    expectedWinner: 'DD',
    answers: {
      P01: 'A', P02: 'A', P03: 'C', P04: 'A', P05: 'B',
      P06: 'D', P07: 'A', P08: 'C', P09: 'A', P10: 'A',
      P11: 'D', P12: 'A', P13: 'B', P14: 'A', P15: 'A',
    },
    expectedScores: { DD: 9, EM: 2, PP: 1, ES: 1, UC: 1, CM: 1 },
  },
  {
    id: 'D-EM',
    name: 'Perfil D-EM · El espejo que miente',
    targetWorkTitle: 'El espejo que miente',
    description: '10 respuestas orientadas a EM. Victoria unívoca prevista con 10 puntos.',
    expectedWinner: 'EM',
    answers: {
      P01: 'B', P02: 'D', P03: 'A', P04: 'A', P05: 'C',
      P06: 'A', P07: 'A', P08: 'B', P09: 'A', P10: 'C',
      P11: 'A', P12: 'C', P13: 'A', P14: 'B', P15: 'D',
    },
    expectedScores: { EM: 10, ES: 3, PP: 2, DD: 0, CM: 0, UC: 0 },
  },
  {
    id: 'D-CM',
    name: 'Perfil D-CM · Cuando el mañana te secuestra',
    targetWorkTitle: 'Cuando el mañana te secuestra',
    description: '10 respuestas orientadas a CM. Victoria unívoca prevista con 10 puntos.',
    expectedWinner: 'CM',
    answers: {
      P01: 'D', P02: 'A', P03: 'B', P04: 'A', P05: 'A',
      P06: 'C', P07: 'A', P08: 'A', P09: 'D', P10: 'A',
      P11: 'B', P12: 'D', P13: 'A', P14: 'A', P15: 'C',
    },
    expectedScores: { CM: 10, DD: 2, EM: 2, ES: 1, PP: 0, UC: 0 },
  },
  {
    id: 'D-ES',
    name: 'Perfil D-ES · El eco del silencio',
    targetWorkTitle: 'El eco del silencio',
    description: '10 respuestas orientadas a ES. Victoria unívoca prevista con 10 puntos.',
    expectedWinner: 'ES',
    answers: {
      P01: 'C', P02: 'A', P03: 'A', P04: 'D', P05: 'A',
      P06: 'B', P07: 'D', P08: 'A', P09: 'A', P10: 'B',
      P11: 'C', P12: 'A', P13: 'A', P14: 'D', P15: 'A',
    },
    expectedScores: { ES: 10, DD: 2, CM: 2, UC: 1, PP: 0, EM: 0 },
  },
  {
    id: 'D-UC',
    name: 'Perfil D-UC · La única certeza',
    targetWorkTitle: 'La única certeza',
    description: '9 respuestas orientadas a UC. Victoria unívoca prevista con 9 puntos.',
    expectedWinner: 'UC',
    answers: {
      P01: 'A', P02: 'C', P03: 'A', P04: 'B', P05: 'D',
      P06: 'A', P07: 'C', P08: 'A', P09: 'B', P10: 'D',
      P11: 'A', P12: 'A', P13: 'D', P14: 'C', P15: 'A',
    },
    expectedScores: { UC: 9, PP: 3, ES: 1, CM: 1, DD: 1, EM: 0 },
  },
  {
    id: 'D-TIE-2',
    name: 'Perfil D-TIE · Empate Doble DD / EM',
    targetWorkTitle: 'Resolución de Empate (DD o EM)',
    description: '7 puntos para DD y 7 puntos para EM. El motor debe seleccionar estrictamente una de las dos.',
    expectedWinner: ['DD', 'EM'],
    answers: {
      P01: 'B', P02: 'A', P03: 'C', P04: 'A', P05: 'B',
      P06: 'D', P07: 'A', P08: 'B', P09: 'B', P10: 'A',
      P11: 'D', P12: 'C', P13: 'B', P14: 'B', P15: 'D',
    },
    expectedScores: { DD: 7, EM: 7, UC: 1, PP: 0, CM: 0, ES: 0 },
  },
  {
    id: 'MANUAL',
    name: 'Consulta Manual · Elección Libre Paso a Paso',
    targetWorkTitle: 'Elección Libre del Tester',
    description: 'Responde libremente de P01 a P15 en la interfaz real para verificar cualquier combinación personalizada.',
    expectedWinner: [],
    answers: null,
  },
];

// Gestión de rotación aislada exclusivamente para el entorno de pruebas
function getTestRotationState(): Record<WorkCode, number> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(TEST_ROTATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid: Record<WorkCode, number> = { DD: 1, PP: 1, EM: 1, CM: 1, ES: 1, UC: 1 };
        for (const code of ALL_WORK_CODES) {
          const val = Number(parsed[code]);
          if (val >= 1 && val <= 5) valid[code] = val;
        }
        return valid;
      }
    } catch {}
  }
  return { DD: 1, PP: 1, EM: 1, CM: 1, ES: 1, UC: 1 };
}

function advanceTestCard(workCode: WorkCode): { cardNumber: number; nextCardNumber: number } {
  const current = getTestRotationState();
  const cardNum = current[workCode] || 1;
  const nextNum = cardNum >= 5 ? 1 : cardNum + 1;
  const updated = { ...current, [workCode]: nextNum };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TEST_ROTATION_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return { cardNumber: cardNum, nextCardNumber: nextNum };
}

interface DecisionVerificationFlowProps {
  onExit: () => void;
}

type FlowStep = 'profile-picker' | 'guided-questioning' | 'audit-results' | 'card-presentation';

export function DecisionVerificationFlow({ onExit }: DecisionVerificationFlowProps) {
  const [step, setStep] = useState<FlowStep>('profile-picker');
  const [activeProfile, setActiveProfile] = useState<DecisionProfile>(CANONICAL_DECISION_PROFILES[0]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [registeredAnswers, setRegisteredAnswers] = useState<Record<string, OptionKey>>({});
  
  // Resultados del motor
  const [evaluationResult, setEvaluationResult] = useState<SelectionScoreResult | null>(null);
  const [selectedCardNum, setSelectedCardNum] = useState<number>(1);
  const [testRotationState, setTestRotationState] = useState<Record<WorkCode, number>>(() => getTestRotationState());

  const currentQId = QUESTION_SEQUENCE[currentQIndex];

  // Iniciar ejecución de un perfil
  const handleStartProfile = (profile: DecisionProfile, mode: 'step-by-step' | 'instant') => {
    setActiveProfile(profile);
    
    if (mode === 'instant' && profile.answers) {
      // Evaluación inmediata con el motor real
      const answers = profile.answers;
      setRegisteredAnswers(answers);
      const res = calculateWinningWork(answers);
      setEvaluationResult(res);
      const cardInfo = advanceTestCard(res.winningWork);
      setSelectedCardNum(cardInfo.cardNumber);
      setTestRotationState(getTestRotationState());
      setStep('audit-results');
    } else {
      // Recorrido paso a paso por la interfaz real
      setRegisteredAnswers({});
      setCurrentQIndex(0);
      setStep('guided-questioning');
    }
  };

  // Manejo de respuesta seleccionada en QuestionScreen real
  const handleAnswerSelected = (answer: AnswerRegistration) => {
    const updated = {
      ...registeredAnswers,
      [answer.questionId]: answer.key,
    };
    setRegisteredAnswers(updated);

    if (currentQIndex < QUESTION_SEQUENCE.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Fin de las 15 preguntas: el motor real procesa las respuestas registradas
      const res = calculateWinningWork(updated);
      setEvaluationResult(res);
      const cardInfo = advanceTestCard(res.winningWork);
      setSelectedCardNum(cardInfo.cardNumber);
      setTestRotationState(getTestRotationState());
      setStep('audit-results');
    }
  };

  const handleResetTestRotations = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TEST_ROTATION_STORAGE_KEY);
      } catch {}
    }
    setTestRotationState({ DD: 1, PP: 1, EM: 1, CM: 1, ES: 1, UC: 1 });
  };

  // Comparación y diagnóstico de resultados
  const comparisonDiagnosis = useMemo(() => {
    if (!evaluationResult) return null;

    const actualWinner = evaluationResult.winningWork;
    const expected = activeProfile.expectedWinner;

    let isMatch = false;
    let matchMessage = '';

    if (Array.isArray(expected)) {
      if (expected.length === 0) {
        isMatch = true;
        matchMessage = `Consulta manual evaluada. Obra seleccionada: ${actualWinner} (${WORKS_METADATA[actualWinner]?.title}).`;
      } else {
        isMatch = expected.includes(actualWinner);
        matchMessage = isMatch
          ? `ÉXITO: El desempate resolvió determinísticamente a favor de ${actualWinner}, miembro legítimo del grupo de empate [${expected.join(', ')}].`
          : `DISCREPANCIA: Se esperaba una de [${expected.join(', ')}], pero el motor seleccionó ${actualWinner}.`;
      }
    } else {
      isMatch = actualWinner === expected;
      matchMessage = isMatch
        ? `ÉXITO: La obra seleccionada (${actualWinner}) coincide exactamente con la obra esperada del perfil.`
        : `DISCREPANCIA: Obra esperada (${expected}) !== Obra obtenida (${actualWinner}).`;
    }

    // Comprobar si las puntuaciones individuales coinciden con las teóricas
    let scoresMatch = true;
    if (activeProfile.expectedScores) {
      for (const code of ALL_WORK_CODES) {
        if (evaluationResult.scores[code] !== activeProfile.expectedScores[code]) {
          scoresMatch = false;
        }
      }
    }

    return {
      isMatch,
      matchMessage,
      scoresMatch,
    };
  }, [evaluationResult, activeProfile]);

  // 1. PANTALLA: SELECTOR DE PERFILES Y MODALIDAD
  if (step === 'profile-picker') {
    return (
      <div className="fixed inset-0 z-50 bg-[#16110D] text-[#EDE7DF] overflow-y-auto p-4 sm:p-6 md:p-10 select-none">
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
          
          {/* CABECERA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C241E] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241C16] border border-[#524133] text-xs font-serif text-[#E5BA8A]">
                <Compass className="w-3.5 h-3.5" />
                <span>Verificación Visual del Motor de Decisión · Entorno de Pruebas</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] tracking-tight">
                Comprobación del Recorrido Real de Decisión
              </h1>
              <p className="text-xs sm:text-sm text-[#A89A8A] font-light max-w-2xl leading-relaxed">
                Ejecuta consultas controladas utilizando la interfaz real de P01–P15 para comprobar que las respuestas conducen exactamente a la obra y carta establecidas por el motor canónico.
              </p>
            </div>

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C241E] hover:bg-[#3D322A] text-[#EDE7DF] text-xs font-serif border border-[#4A3E34] transition-all cursor-pointer shadow hover:text-[#FFFFFF]"
            >
              <ArrowLeft className="w-4 h-4 text-[#C4B5A5]" />
              <span>Volver a La Consulta</span>
            </button>
          </div>

          {/* TELEMETRÍA DE ROTACIÓN AISLADA DE PRUEBA */}
          <div className="p-4 rounded-xl bg-[#1F1914] border border-[#382E25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#81C784]" />
                <span className="text-xs font-serif text-[#E8DFD5] font-medium">
                  Almacenamiento y Contadores Aislados de Prueba
                </span>
              </div>
              <p className="text-[11px] text-[#A89A8A] font-light">
                Las pruebas de decisión avanzan su propio contador de rotación independiente sin alterar la rotación de las lectoras reales.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#C4B5A5]">
                {ALL_WORK_CODES.map((code) => (
                  <span key={code} className="px-2 py-0.5 rounded bg-[#2A2119] border border-[#423326]">
                    {code}: Carta {testRotationState[code]} de 5
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetTestRotations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2A2119] hover:bg-[#382C22] text-[#C4B5A5] text-[11px] font-serif border border-[#47382B] transition-colors cursor-pointer"
              title="Reiniciar contadores de prueba a la carta 1 para todas las obras"
            >
              <RotateCcw className="w-3 h-3 text-[#A89A8A]" />
              <span>Reiniciar contadores de prueba</span>
            </button>
          </div>

          {/* LISTA DE PERFILES DE PRUEBA */}
          <div className="space-y-4">
            <h2 className="text-base font-serif text-[#FFFFFF] tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Perfiles Deterministas de Prueba y Consulta Manual</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CANONICAL_DECISION_PROFILES.map((profile) => {
                const isManual = profile.answers === null;
                return (
                  <div
                    key={profile.id}
                    data-profile-id={profile.id}
                    className="p-5 rounded-xl bg-[#1C1713]/90 border border-[#2E241C] flex flex-col justify-between space-y-4 shadow hover:border-[#4A3B2E] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-serif font-medium bg-[#2C2117] text-[#D4A373] border border-[#473424]">
                          {profile.id}
                        </span>
                        {!isManual && (
                          <span className="text-[11px] font-mono text-[#8C8176]">
                            Gana: {Array.isArray(profile.expectedWinner) ? profile.expectedWinner.join(' / ') : profile.expectedWinner}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-serif text-[#FFFFFF] font-normal">
                        {profile.name}
                      </h3>

                      <p className="text-xs text-[#A89A8A] font-light leading-relaxed">
                        {profile.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#261E18]">
                      {isManual ? (
                        <button
                          type="button"
                          onClick={() => handleStartProfile(profile, 'step-by-step')}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-[#FFFFFF] text-xs font-serif transition-colors cursor-pointer border border-[#6B4E35]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-[#D4A373]" />
                          <span>Iniciar Consulta Libre Paso a Paso</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartProfile(profile, 'step-by-step')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#2A2119] hover:bg-[#382C22] text-[#EDE7DF] text-xs font-serif transition-colors cursor-pointer border border-[#47382B]"
                            title="Recorrer las 15 preguntas en la pantalla real con sugerencia de respuestas"
                          >
                            <Play className="w-3 h-3 text-[#D4A373]" />
                            <span>Recorrer paso a paso</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartProfile(profile, 'instant')}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-[#FFFFFF] text-xs font-serif transition-colors cursor-pointer border border-[#6B4E35]"
                            title="Procesar directamente con el motor y auditar el resultado"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#E5BA8A]" />
                            <span>Evaluación directa</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 2. PANTALLA: RECORRIDO PASO A PASO POR LA INTERFAZ REAL (QuestionScreen)
  if (step === 'guided-questioning') {
    const suggestedOption = activeProfile.answers ? activeProfile.answers[currentQId] : null;

    return (
      <div className="relative w-full h-full">
        {/* BARRA SUPERIOR DE TELEMETRÍA Y CONTROLES DE APOYO (z-[70] SOBRE QuestionScreen) */}
        <div className="fixed top-2 left-2 right-2 z-[70] pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#1C1713]/95 backdrop-blur-md border border-[#3E3228] shadow-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('profile-picker')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2119] hover:bg-[#382C22] text-[#EDE7DF] text-xs font-serif border border-[#47382B] transition-all cursor-pointer shadow hover:text-[#FFFFFF]"
              title="Cancelar y volver al selector de perfiles"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C4B5A5]" />
              <span>Selector</span>
            </button>

            {currentQIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => prev - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#241C16] hover:bg-[#34271E] text-[#C4B5A5] text-xs font-serif border border-[#3E3228] transition-all cursor-pointer"
                title={`Retroceder a P${String(currentQIndex).padStart(2, '0')}`}
              >
                <ArrowLeft className="w-3 h-3 text-[#A89A8A]" />
                <span>P{String(currentQIndex).padStart(2, '0')}</span>
              </button>
            )}

            <span className="px-2.5 py-1 rounded bg-[#2C2117] text-[#D4A373] text-[11px] font-serif font-medium border border-[#473424]">
              {activeProfile.id}
            </span>

            <span className="text-xs font-serif text-[#FFFFFF] font-medium hidden sm:inline">
              Pregunta {currentQIndex + 1} de 15 ({currentQId})
            </span>
          </div>

          {/* AYUDA DE PERFIL DETERMINISTA (OPCIÓN SUGERIDA Y CONTROL DE APOYO) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {suggestedOption && (
              <div className="flex items-center gap-2 bg-[#261E18] px-3 py-1.5 rounded-lg border border-[#3D2F24] shadow-sm">
                <span className="text-xs text-[#A89A8A] font-serif">Opción canónica:</span>
                <span className="px-2 py-0.5 rounded bg-[#3D2C1E] text-[#FFFFFF] font-mono text-xs font-bold border border-[#6B4E35]">
                  {suggestedOption}
                </span>
                <button
                  type="button"
                  data-testid="support-answer-btn"
                  onClick={() => {
                    handleAnswerSelected({
                      questionId: currentQId,
                      questionNumber: currentQIndex + 1,
                      key: suggestedOption,
                      responseNumber: suggestedOption === 'A' ? 1 : suggestedOption === 'B' ? 2 : suggestedOption === 'C' ? 3 : 4,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#3D2C1E] hover:bg-[#523B29] text-[#E5BA8A] hover:text-[#FFFFFF] text-xs font-serif font-medium cursor-pointer transition-colors border border-[#6B4E35]"
                  title={`Pulsar automáticamente la opción ${suggestedOption} requerida por este perfil`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current text-[#D4A373]" />
                  <span>Pulsar opción {suggestedOption}</span>
                </button>
              </div>
            )}

            <div className="text-[11px] font-mono text-[#8C8176] hidden md:block">
              Registradas: {Object.keys(registeredAnswers).length}/15
            </div>

            <button
              type="button"
              onClick={() => {
                setRegisteredAnswers({});
                setCurrentQIndex(0);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#241C16] hover:bg-[#34271E] text-[#A89A8A] hover:text-[#EDE7DF] text-xs font-serif border border-[#382E25] transition-all cursor-pointer"
              title="Reiniciar respuestas de esta prueba a P01"
            >
              <RotateCcw className="w-3 h-3 text-[#A89A8A]" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>

        {/* PANTALLA REAL DE LA CONSULTA CON REMONTAJE LIMPIO POR PREGUNTA (key={currentQId}) */}
        <QuestionScreen
          key={currentQId}
          questionId={currentQId}
          deviceMode="auto"
          hideDefaultNav={true}
          onBack={() => {
            if (currentQIndex > 0) {
              setCurrentQIndex((prev) => prev - 1);
            } else {
              setStep('profile-picker');
            }
          }}
          onResetAll={() => setStep('profile-picker')}
          onAnswerSelected={handleAnswerSelected}
        />
      </div>
    );
  }

  // 3. PANTALLA: INFORME Y AUDITORÍA DE RESULTADOS DEL MOTOR
  if (step === 'audit-results' && evaluationResult) {
    const winnerCode = evaluationResult.winningWork;
    const winnerMeta = WORKS_METADATA[winnerCode];
    const cardDef = getCardForWork(winnerCode, selectedCardNum);

    return (
      <div className="fixed inset-0 z-50 bg-[#16110D] text-[#EDE7DF] overflow-y-auto p-4 sm:p-6 md:p-10 select-none">
        <div className="max-w-4xl mx-auto space-y-6 pb-16">
          
          {/* CABECERA DE INFORME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C241E] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#241C16] border border-[#423326] text-xs font-serif text-[#D4A373]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auditoría de Resultados de la Decisión</span>
              </div>
              <h1 className="text-2xl font-serif text-[#FFFFFF] mt-1">
                Informe de Verificación: {activeProfile.name}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setStep('profile-picker')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2C241E] hover:bg-[#3D322A] text-[#EDE7DF] text-xs font-serif border border-[#4A3E34] transition-all cursor-pointer shadow hover:text-[#FFFFFF]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C4B5A5]" />
              <span>Probar otro perfil</span>
            </button>
          </div>

          {/* DIAGNÓSTICO DE COINCIDENCIA */}
          {comparisonDiagnosis && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                comparisonDiagnosis.isMatch
                  ? 'bg-[#18261A]/90 border-[#2E4731] text-[#E0EFE2]'
                  : 'bg-[#2E1818]/90 border-[#522929] text-[#F3D5D5]'
              }`}
            >
              {comparisonDiagnosis.isMatch ? (
                <CheckCircle2 className="w-5 h-5 text-[#81C784] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-[#E57373] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-serif font-medium">
                  {comparisonDiagnosis.isMatch ? 'VERIFICACIÓN SUPERADA CON ÉXITO' : 'DISCREPANCIA DETECTADA'}
                </p>
                <p className="text-xs font-light leading-relaxed">
                  {comparisonDiagnosis.matchMessage}
                </p>
                {activeProfile.expectedScores && (
                  <p className="text-[11px] font-mono mt-1 opacity-90">
                    Cómputo matemático individual: {comparisonDiagnosis.scoresMatch ? '100% exacto conforme a la matriz' : 'Discrepancia en puntuaciones'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CONTENEDOR 1: DECISIÓN DEL MOTOR (OBRA Y PUNTUACIONES) */}
          <div className="p-5 rounded-xl bg-[#1C1713]/90 border border-[#2E241C] space-y-4">
            <h2 className="text-sm font-serif text-[#D4A373] uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Decisión 1: Obra Seleccionada por el Motor Real</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#16110D] p-4 rounded-lg border border-[#2C2117]">
              <div>
                <span className="text-[11px] text-[#8C8176] uppercase tracking-wider block">Obra Ganadora Determinada</span>
                <p className="text-lg font-serif text-[#FFFFFF] mt-0.5 font-medium">
                  {winnerCode} — {winnerMeta.title}
                </p>
                <p className="text-xs text-[#A89A8A] font-light mt-0.5">
                  {winnerMeta.description}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[#8C8176] uppercase tracking-wider block">Condición de Empate</span>
                <p className="text-sm font-serif text-[#EDE7DF] mt-1">
                  {evaluationResult.tiedWorks.length === 1
                    ? 'Victoria unívoca sin empates'
                    : `Empate entre ${evaluationResult.tiedWorks.length} obras: [${evaluationResult.tiedWorks.join(', ')}]`}
                </p>
                <p className="text-xs text-[#A89A8A] font-light mt-0.5">
                  Total de respuestas procesadas: {evaluationResult.totalAnswersProcessed} de 15
                </p>
              </div>
            </div>

            {/* DESGLOSE DE PUNTUACIONES DE LAS 6 OBRAS */}
            <div className="space-y-2">
              <span className="text-xs font-serif text-[#A89A8A]">Desglose de puntos por obra (Suma = 15):</span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {ALL_WORK_CODES.map((code) => {
                  const pts = evaluationResult.scores[code];
                  const isWinner = code === winnerCode;
                  return (
                    <div
                      key={code}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isWinner
                          ? 'bg-[#3D2C1E] border-[#6B4E35] text-[#FFFFFF]'
                          : 'bg-[#181310] border-[#2E241C] text-[#A89A8A]'
                      }`}
                    >
                      <span className="text-[11px] font-serif block font-medium">{code}</span>
                      <span className="text-lg font-serif font-bold">{pts}</span>
                      <span className="text-[10px] block opacity-75">pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTENEDOR 2: DECISIÓN DE CATÁLOGO Y ROTACIÓN */}
          <div className="p-5 rounded-xl bg-[#1C1713]/90 border border-[#2E241C] space-y-4">
            <h2 className="text-sm font-serif text-[#D4A373] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Decisión 2: Carta Entregada y Rotación Establecida</span>
            </h2>

            <div className="bg-[#16110D] p-4 rounded-lg border border-[#2C2117] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-serif text-[#FFFFFF]">
                    Carta {cardDef.cardNumber} de 5 de {winnerCode}
                  </span>
                  {cardDef.isDefinitive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#3D2C1A] text-[#E5BA8A] font-serif border border-[#6B4E2B]">
                      Contenido Definitivo Aprobado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#241C16] text-[#A89A8A] font-serif border border-[#3E3228]">
                      Estado Provisional Protegido
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A89A8A] font-light">
                  Título presentado: «{cardDef.title}»
                </p>
                <p className="text-[11px] text-[#7C7166] font-mono">
                  Siguiente posición para {winnerCode} en rotación de prueba: {cardDef.cardNumber >= 5 ? 1 : cardDef.cardNumber + 1}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep('card-presentation')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-[#FFFFFF] text-xs font-serif transition-colors cursor-pointer border border-[#6B4E35] shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-[#E5BA8A]" />
                <span>Ver presentación real de la carta</span>
              </button>
            </div>
          </div>

          {/* CONTENEDOR 3: VECTOR DE RESPUESTAS REGISTRADAS */}
          <div className="p-4 rounded-xl bg-[#1C1713]/70 border border-[#2A2017] space-y-2">
            <span className="text-xs font-serif text-[#A89A8A]">Vector de respuestas registradas (P01–P15):</span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {QUESTION_SEQUENCE.map((qId) => {
                const ans = registeredAnswers[qId] || '-';
                return (
                  <span key={qId} className="px-2 py-1 rounded bg-[#16110D] border border-[#2E241C] text-[#C4B5A5]">
                    {qId}: <strong className="text-[#FFFFFF]">{ans}</strong>
                  </span>
                );
              })}
            </div>
          </div>

          {/* BOTONES DE CONTINUACIÓN */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('profile-picker')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C241E] hover:bg-[#3D322A] text-[#EDE7DF] text-xs font-serif border border-[#4A3E34] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C4B5A5]" />
              <span>Volver a la selección de perfiles</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartProfile(activeProfile, 'instant')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-[#FFFFFF] text-xs font-serif border border-[#6B4E35] transition-all cursor-pointer"
              title="Volver a ejecutar para verificar el avance de rotación (1 -> 2 -> 3 -> 4 -> 5 -> 1)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E5BA8A]" />
              <span>Reejecutar para avanzar rotación</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 4. PANTALLA: PRESENTACIÓN REAL DE LA CARTA VIA PostP15Flow
  if (step === 'card-presentation' && evaluationResult) {
    return (
      <PostP15Flow
        key={`decision-verify-${evaluationResult.winningWork}-${selectedCardNum}`}
        selectedWork={evaluationResult.winningWork}
        cardNumber={selectedCardNum}
        initialPhase="letter-reading"
        onBackToSelector={() => setStep('audit-results')}
        onResetExperience={() => setStep('profile-picker')}
      />
    );
  }

  return null;
}
