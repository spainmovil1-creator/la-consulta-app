'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Film, AlertCircle, Volume2, VolumeX, FastForward, RotateCcw, ArrowRight, Eye, Compass } from 'lucide-react';
import { VESTIBULO_ASSETS } from '@/lib/vestibuloConfig';
import { QuestionScreen, AnswerRegistration } from '@/components/consultation/QuestionScreen';
import { ValidationScreen } from '@/components/consultation/ValidationScreen';
import { PostP15Flow } from '@/components/consultation/PostConsultationFlow';
import { VisualCheckerSelector } from '@/components/consultation/VisualCheckerSelector';
import { DecisionVerificationFlow } from '@/components/consultation/DecisionVerificationFlow';
import { WorksSelectorScreen } from '@/components/consultation/WorksSelectorScreen';
import {
  recognizeStub,
  calculateWinningWork,
  getAndAdvanceCardForWork,
  type EngineAnswer,
  type OptionValue,
  type WorkCode,
  type OptionKey,
} from '@/engine';

type Stage =
  | 'intro-screen'
  | 'video-playing'
  | 'vestibulo'
  | 'visual-checker-selector'
  | 'visual-checker-card'
  | 'decision-verification'
  | 'p01'
  | 'p01-validated'
  | 'p02'
  | 'p02-validated'
  | 'p03'
  | 'p03-validated'
  | 'p04'
  | 'p04-validated'
  | 'p05'
  | 'p05-validated'
  | 'p06'
  | 'p07'
  | 'p08'
  | 'p09'
  | 'p10'
  | 'p11'
  | 'p12'
  | 'p13'
  | 'p14'
  | 'p15'
  | 'post-p15'
  | 'post-p15-exits'
  | 'works-selector'
  | 'completed';

type TransitionPhase = 'playing' | 'crossfading' | 'finished';
type DeviceMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

export function IntroExperience({
  initialStage,
  initialWork,
}: {
  initialStage?: Stage;
  initialWork?: WorkCode;
}) {
  const [stage, setStage] = useState<Stage>(initialStage ?? 'intro-screen');
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('playing');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(19.3);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');

  // Respuestas registradas en el motor
  const [p01Answer, setP01Answer] = useState<AnswerRegistration | null>(null);
  const [p02Answer, setP02Answer] = useState<AnswerRegistration | null>(null);
  const [p03Answer, setP03Answer] = useState<AnswerRegistration | null>(null);
  const [p04Answer, setP04Answer] = useState<AnswerRegistration | null>(null);
  const [p05Answer, setP05Answer] = useState<AnswerRegistration | null>(null);
  const [p06Answer, setP06Answer] = useState<AnswerRegistration | null>(null);
  const [p07Answer, setP07Answer] = useState<AnswerRegistration | null>(null);
  const [p08Answer, setP08Answer] = useState<AnswerRegistration | null>(null);
  const [p09Answer, setP09Answer] = useState<AnswerRegistration | null>(null);
  const [p10Answer, setP10Answer] = useState<AnswerRegistration | null>(null);
  const [p11Answer, setP11Answer] = useState<AnswerRegistration | null>(null);
  const [p12Answer, setP12Answer] = useState<AnswerRegistration | null>(null);
  const [p13Answer, setP13Answer] = useState<AnswerRegistration | null>(null);
  const [p14Answer, setP14Answer] = useState<AnswerRegistration | null>(null);
  const [p15Answer, setP15Answer] = useState<AnswerRegistration | null>(null);
  const [selectedWork, setSelectedWork] = useState<WorkCode | null>(
    initialWork ?? (initialStage === 'post-p15-exits' || initialStage === 'post-p15' ? 'PP' : null)
  );
  const [selectedCardNumber, setSelectedCardNumber] = useState<number | null>(
    initialStage === 'post-p15-exits' || initialStage === 'post-p15' ? 1 : null
  );


  // Estado aislado para el modo de comprobación visual (sin alterar contadores reales)
  const [checkerWork, setCheckerWork] = useState<WorkCode>('PP');
  const [checkerCardNumber, setCheckerCardNumber] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transitionStartedRef = useRef(false);

  const handleStartVideo = () => {
    setVideoError(null);
    setIsMuted(false);
    transitionStartedRef.current = false;
    setTransitionPhase('playing');
    setStage('video-playing');
  };

  const handleResetExperience = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    transitionStartedRef.current = false;
    setTransitionPhase('playing');
    setStage('intro-screen');
    setCurrentTime(0);
    setP01Answer(null);
    setP02Answer(null);
    setP03Answer(null);
    setP04Answer(null);
    setP05Answer(null);
    setP06Answer(null);
    setP07Answer(null);
    setP08Answer(null);
    setP09Answer(null);
    setP10Answer(null);
    setP11Answer(null);
    setP12Answer(null);
    setP13Answer(null);
    setP14Answer(null);
    setP15Answer(null);
    setSelectedWork(null);
    setSelectedCardNumber(null);
  }, []);

  // Atajo de teclado: pulsar tecla Escape permite volver atrás en cualquier momento
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'intro-screen') {
        handleResetExperience();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, handleResetExperience]);

  useEffect(() => {
    if (stage === 'video-playing' && videoRef.current) {
      const v = videoRef.current;
      v.currentTime = 0;
      v.muted = false;
      v.volume = 1.0;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(v.muted || v.volume === 0);
          })
          .catch((err) => {
            console.warn('El navegador bloqueó audio automático en el iFrame:', err);
            v.muted = true;
            setIsMuted(true);
            v.play().catch(() => {});
          });
      }
    }
  }, [stage]);

  // Transición suave cinematográfica: fundido encadenado (crossfade) de 1.8s
  const triggerCrossfade = useCallback(() => {
    if (transitionStartedRef.current) return;
    transitionStartedRef.current = true;
    setTransitionPhase('crossfading');

    setTimeout(() => {
      setStage('vestibulo');
      setTransitionPhase('finished');
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 1800);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const total = videoRef.current.duration || 19.3;
      setCurrentTime(time);
      setDuration(total);

      if (time >= total - 1.8 && !transitionStartedRef.current && stage === 'video-playing') {
        triggerCrossfade();
      }
    }
  };

  const handleVideoEnded = () => {
    if (!transitionStartedRef.current) {
      triggerCrossfade();
    }
  };

  const unmuteAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  const jumpToVoice = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 7.8;
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const targetMuted = !videoRef.current.muted;
      videoRef.current.muted = targetMuted;
      setIsMuted(targetMuted);
    }
  };

  const isSpeakingZone = currentTime >= 7.8;
  const isCrossfading = transitionPhase === 'crossfading';
  const isFinished = stage === 'vestibulo' && transitionPhase === 'finished';

  const getActiveAsset = () => {
    if (deviceMode !== 'auto') {
      return VESTIBULO_ASSETS[deviceMode];
    }
    return VESTIBULO_ASSETS.desktop;
  };

  const activeAsset = getActiveAsset();

  return (
    <>
      {/* 1. INTRO DE ACCESO CON SELECTOR DE PRUEBAS */}
      {stage === 'intro-screen' && (
        <div className="w-full flex flex-col items-center justify-center my-auto min-h-[65vh]">
          <div className="w-full max-w-2xl mx-auto bg-[#FFFFFF] border border-[#E8E1D9] rounded-2xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE9] border border-[#E0D8CE] text-xs font-mono text-[#7A7168]">
              <Film className="w-3.5 h-3.5 text-[#8C7A6B]" />
              Fase 12 · P08 Desktop, Tablet (p08tablet) y Móvil (p08movil)
            </div>

            <div className="space-y-4 max-w-lg">
              <span className="text-xs uppercase tracking-widest text-[#9C8F80] font-medium block">
                La Consulta · Elena Vargas
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#1F1D1A] tracking-tight">
                Introducción a la Casa
              </h1>
              <p className="text-sm sm:text-base text-[#5C544D] font-light leading-relaxed italic">
                «Hola. Si has llegado hasta aquí, quizá haya algo que te haya traído. No hace falta que sepas exactamente qué. Podemos quedarnos un momento.»
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 w-full justify-center">
              <button
                type="button"
                onClick={handleStartVideo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2C2926] text-[#FBF9F5] text-xs font-medium hover:bg-[#1A1816] transition-all cursor-pointer shadow-sm hover:shadow"
                title="Reproducir vídeo de presentación"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ver vídeo</span>
              </button>

              <button
                type="button"
                onClick={() => setStage('visual-checker-selector')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#241C16] border border-[#524133] text-[#F3ECE4] text-xs font-medium hover:bg-[#34271E] hover:border-[#735B47] transition-all cursor-pointer shadow-sm hover:shadow"
                title="Abrir selector de comprobación visual de las 30 cartas (PP, ES, EM, CM, DD, UC)"
              >
                <Eye className="w-3.5 h-3.5 text-[#E5BA8A]" />
                <span>Comprobación Visual (30 cartas)</span>
              </button>

              <button
                type="button"
                onClick={() => setStage('decision-verification')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2015] border border-[#6B4B32] text-[#F5ECE3] text-xs font-medium hover:bg-[#3D2B1C] hover:border-[#8C6242] transition-all cursor-pointer shadow-sm hover:shadow"
                title="Abrir verificación visual del motor de decisión (P01–P15 -> Obra -> Carta)"
              >
                <Compass className="w-3.5 h-3.5 text-[#E5BA8A]" />
                <span>Verificación del Motor (Decisión)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedWork) {
                    const cardInfo = getAndAdvanceCardForWork('PP');
                    setSelectedWork('PP');
                    setSelectedCardNumber(cardInfo.cardNumber);
                  }
                  setStage('post-p15');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3D2C1E] text-[#FBF9F5] text-xs font-medium hover:bg-[#2C1F15] transition-all cursor-pointer shadow-sm hover:shadow"
                title="Acceso directo a la fase posterior a P15 (Vídeo de Elena + Carta editorial)"
              >
                <Film className="w-3.5 h-3.5 text-[#E0D5C7]" />
                <span>Vídeo Elena + Carta (Post-P15)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStage('works-selector');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#4E3827] border border-[#6B4B32] text-[#FDFBF7] text-xs font-medium hover:bg-[#3D2B1C] transition-all cursor-pointer shadow-sm hover:shadow"
                title="Acceso directo al selector de las seis obras para revisión editorial"
              >
                <Compass className="w-3.5 h-3.5 text-[#E5BA8A]" />
                <span>Páginas de las seis obras</span>
              </button>

              <button
                type="button"
                onClick={() => setStage('p01')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#F5EFE6] border border-[#D9CFC4] text-[#3D352E] text-xs font-medium hover:bg-[#ECE3D6] transition-all cursor-pointer"
                title="Acceso directo a P01"
              >
                <span>P01</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p02')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#EDE7DF] border border-[#CFC5B8] text-[#2C241E] text-xs font-medium hover:bg-[#E3DBCF] transition-all cursor-pointer"
                title="Acceso directo a P02"
              >
                <span>P02</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p03')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#E2D8CC] border border-[#BCB0A0] text-[#1F1710] text-xs font-medium hover:bg-[#D7CBBE] transition-all cursor-pointer"
                title="Acceso directo a P03"
              >
                <span>P03</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p04')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#DCD1C2] border border-[#B0A290] text-[#1B140D] text-xs font-medium hover:bg-[#D0C3B2] transition-all cursor-pointer"
                title="Acceso directo a P04"
              >
                <span>P04</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p05')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#CFBEA9] border border-[#A18F7B] text-[#140E08] text-xs font-medium hover:bg-[#C4B29C] transition-all cursor-pointer"
                title="Acceso directo a P05"
              >
                <span>P05</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p06')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#C2AF98] border border-[#917E69] text-[#100B06] text-xs font-medium hover:bg-[#B7A38B] transition-all cursor-pointer"
                title="Acceso directo a P06"
              >
                <span>P06</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p07')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#B5A086] border border-[#857159] text-[#0A0704] text-xs font-medium hover:bg-[#AA9478] transition-all cursor-pointer"
                title="Acceso directo a P07"
              >
                <span>P07</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p08')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#A89174] border border-[#786348] text-[#0A0704] text-xs font-medium hover:bg-[#9B8467] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P08"
              >
                <span>P08</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p09')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#967C5D] border border-[#685235] text-[#FFFFFF] text-xs font-medium hover:bg-[#856D4F] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P09"
              >
                <span>P09</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p10')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#8A6F4E] border border-[#5E482C] text-[#FFFFFF] text-xs font-medium hover:bg-[#795F3E] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P10"
              >
                <span>P10</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p11')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#7B6142] border border-[#503E26] text-[#FFFFFF] text-xs font-medium hover:bg-[#6C5335] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P11"
              >
                <span>P11</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p12')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#6D5437] border border-[#44341F] text-[#FFFFFF] text-xs font-medium hover:bg-[#5E482E] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P12"
              >
                <span>P12</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p13')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#5F482D] border border-[#3A2C1A] text-[#FFFFFF] text-xs font-medium hover:bg-[#503C24] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P13"
              >
                <span>P13</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p14')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#523D24] border border-[#302313] text-[#FFFFFF] text-xs font-medium hover:bg-[#43311C] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P14"
              >
                <span>P14</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setStage('p15')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[#44321D] border border-[#261A0C] text-[#FFFFFF] text-xs font-medium hover:bg-[#352514] transition-all cursor-pointer shadow-sm"
                title="Acceso directo a P15"
              >
                <span>P15</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 pt-5 border-t border-[#F0EBE3] w-full text-xs text-[#8A8177]">
              <span className="font-mono text-[11px] text-[#7A7168]">
                Assets integrados: P01 a P15 en Desktop (16:9), Tablet (3:4) y Móvil (9:16)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. PREGUNTA P01 */}
      {stage === 'p01' && (
        <QuestionScreen
          questionId="P01"
          deviceMode={deviceMode}
          onBack={() => setStage('vestibulo')}
          backLabel="Vestíbulo"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP01Answer(answer);
            setStage('p01-validated');
          }}
        />
      )}

      {/* 2B. PANTALLA DE VALIDACIÓN TÉCNICA DE P01 */}
      {stage === 'p01-validated' && p01Answer && (
        <ValidationScreen
          answer={p01Answer}
          onNextQuestion={() => setStage('p02')}
          nextQuestionLabel="Continuar a Pregunta 2"
          onRetryQuestion={() => setStage('p01')}
          onBackToPrevious={() => setStage('vestibulo')}
          backToPreviousLabel="Volver al Vestíbulo"
          onResetAll={handleResetExperience}
          isLastAvailableQuestion={false}
        />
      )}

      {/* 3. PREGUNTA P02 */}
      {stage === 'p02' && (
        <QuestionScreen
          questionId="P02"
          deviceMode={deviceMode}
          onBack={() => setStage('p01')}
          backLabel="Pregunta 1"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP02Answer(answer);
            setStage('p02-validated');
          }}
        />
      )}

      {/* 3B. PANTALLA DE VALIDACIÓN TÉCNICA DE P02 */}
      {stage === 'p02-validated' && p02Answer && (
        <ValidationScreen
          answer={p02Answer}
          onNextQuestion={() => setStage('p03')}
          nextQuestionLabel="Continuar a Pregunta 3"
          onRetryQuestion={() => setStage('p02')}
          onBackToPrevious={() => setStage('p01')}
          backToPreviousLabel="Volver a P01"
          onResetAll={handleResetExperience}
          isLastAvailableQuestion={false}
        />
      )}

      {/* 4. PREGUNTA P03 */}
      {stage === 'p03' && (
        <QuestionScreen
          questionId="P03"
          deviceMode={deviceMode}
          onBack={() => setStage('p02')}
          backLabel="Pregunta 2"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP03Answer(answer);
            setStage('p03-validated');
          }}
        />
      )}

      {/* 4B. PANTALLA DE VALIDACIÓN TÉCNICA DE P03 */}
      {stage === 'p03-validated' && p03Answer && (
        <ValidationScreen
          answer={p03Answer}
          onNextQuestion={() => setStage('p04')}
          nextQuestionLabel="Continuar a Pregunta 4"
          onRetryQuestion={() => setStage('p03')}
          onBackToPrevious={() => setStage('p02')}
          backToPreviousLabel="Volver a P02"
          onResetAll={handleResetExperience}
          isLastAvailableQuestion={false}
        />
      )}

      {/* 5. PREGUNTA P04 */}
      {stage === 'p04' && (
        <QuestionScreen
          questionId="P04"
          deviceMode={deviceMode}
          onBack={() => setStage('p03')}
          backLabel="Pregunta 3"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP04Answer(answer);
            setStage('p04-validated');
          }}
        />
      )}

      {/* 5B. PANTALLA DE VALIDACIÓN TÉCNICA DE P04 */}
      {stage === 'p04-validated' && p04Answer && (
        <ValidationScreen
          answer={p04Answer}
          onNextQuestion={() => setStage('p05')}
          nextQuestionLabel="Continuar a Pregunta 5"
          onRetryQuestion={() => setStage('p04')}
          onBackToPrevious={() => setStage('p03')}
          backToPreviousLabel="Volver a P03"
          onResetAll={handleResetExperience}
          isLastAvailableQuestion={false}
        />
      )}

      {/* 6. PREGUNTA P05 */}
      {stage === 'p05' && (
        <QuestionScreen
          questionId="P05"
          deviceMode={deviceMode}
          onBack={() => setStage('p04')}
          backLabel="Pregunta 4"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP05Answer(answer);
            setStage('p05-validated');
          }}
        />
      )}

      {/* 6B. PANTALLA DE VALIDACIÓN TÉCNICA DE P05 */}
      {stage === 'p05-validated' && p05Answer && (
        <ValidationScreen
          answer={p05Answer}
          onNextQuestion={() => setStage('p06')}
          nextQuestionLabel="Continuar a Pregunta 6"
          onRetryQuestion={() => setStage('p05')}
          onBackToPrevious={() => setStage('p04')}
          backToPreviousLabel="Volver a P04"
          onResetAll={handleResetExperience}
          isLastAvailableQuestion={false}
        />
      )}

      {/* 7. PREGUNTA P06 (TRANSICIÓN DIRECTA A P07) */}
      {stage === 'p06' && (
        <QuestionScreen
          questionId="P06"
          deviceMode={deviceMode}
          onBack={() => setStage('p05')}
          backLabel="Pregunta 5"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP06Answer(answer);
            setStage('p07');
          }}
        />
      )}

      {/* 8. PREGUNTA P07 (TRANSICIÓN DIRECTA A P08) */}
      {stage === 'p07' && (
        <QuestionScreen
          questionId="P07"
          deviceMode={deviceMode}
          onBack={() => setStage('p06')}
          backLabel="Pregunta 6"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP07Answer(answer);
            setStage('p08');
          }}
        />
      )}

      {/* 9. PREGUNTA P08 (TRANSICIÓN DIRECTA A P09 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p08' && (
        <QuestionScreen
          questionId="P08"
          deviceMode={deviceMode}
          onBack={() => setStage('p07')}
          backLabel="Pregunta 7"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP08Answer(answer);
            // Transición automática directa a P09 sin pantalla técnica intermedia
            setStage('p09');
          }}
        />
      )}

      {/* 10. PREGUNTA P09 (TRANSICIÓN DIRECTA A P10 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p09' && (
        <QuestionScreen
          questionId="P09"
          deviceMode={deviceMode}
          onBack={() => setStage('p08')}
          backLabel="Pregunta 8"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP09Answer(answer);
            // Transición automática directa a P10 sin pantalla técnica intermedia
            setStage('p10');
          }}
        />
      )}

      {/* 11. PREGUNTA P10 (TRANSICIÓN DIRECTA A P11 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p10' && (
        <QuestionScreen
          questionId="P10"
          deviceMode={deviceMode}
          onBack={() => setStage('p09')}
          backLabel="Pregunta 9"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP10Answer(answer);
            // Transición automática directa a P11 sin pantalla técnica intermedia
            setStage('p11');
          }}
        />
      )}

      {/* 12. PREGUNTA P11 (TRANSICIÓN DIRECTA A P12 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p11' && (
        <QuestionScreen
          questionId="P11"
          deviceMode={deviceMode}
          onBack={() => setStage('p10')}
          backLabel="Pregunta 10"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP11Answer(answer);
            // Transición automática directa a P12 sin pantalla técnica intermedia
            setStage('p12');
          }}
        />
      )}

      {/* 13. PREGUNTA P12 (TRANSICIÓN DIRECTA A P13 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p12' && (
        <QuestionScreen
          questionId="P12"
          deviceMode={deviceMode}
          onBack={() => setStage('p11')}
          backLabel="Pregunta 11"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP12Answer(answer);
            // Transición automática directa a P13 sin pantalla técnica intermedia
            setStage('p13');
          }}
        />
      )}

      {/* 14. PREGUNTA P13 (TRANSICIÓN DIRECTA A P14 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p13' && (
        <QuestionScreen
          questionId="P13"
          deviceMode={deviceMode}
          onBack={() => setStage('p12')}
          backLabel="Pregunta 12"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP13Answer(answer);
            // Transición automática directa a P14 sin pantalla técnica intermedia
            setStage('p14');
          }}
        />
      )}

      {/* 15. PREGUNTA P14 (TRANSICIÓN DIRECTA A P15 SIN PANTALLA DE VALIDACIÓN) */}
      {stage === 'p14' && (
        <QuestionScreen
          questionId="P14"
          deviceMode={deviceMode}
          onBack={() => setStage('p13')}
          backLabel="Pregunta 13"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP14Answer(answer);
            // Transición automática directa a P15 sin pantalla técnica intermedia
            setStage('p15');
          }}
        />
      )}

      {/* 16. PREGUNTA P15 (TRANSICIÓN AUTOMÁTICA DIRECTA A LA FINALIZACIÓN DE LA CONSULTA) */}
      {stage === 'p15' && (
        <QuestionScreen
          questionId="P15"
          deviceMode={deviceMode}
          onBack={() => setStage('p14')}
          backLabel="Pregunta 14"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP15Answer(answer);
            // Salida de La Consulta: transición directa a finalización / Recognition Engine
            const allAnswers: EngineAnswer[] = [
              { questionId: 'P01', value: (p01Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P02', value: (p02Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P03', value: (p03Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P04', value: (p04Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P05', value: (p05Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P06', value: (p06Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P07', value: (p07Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P08', value: (p08Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P09', value: (p09Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P10', value: (p10Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P11', value: (p11Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P12', value: (p12Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P13', value: (p13Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P14', value: (p14Answer?.responseNumber ?? 1) as OptionValue },
              { questionId: 'P15', value: answer.responseNumber as OptionValue },
            ];
            // Entregar las 15 respuestas al Recognition Engine
            recognizeStub(allAnswers);

            // 1. Mapeo de respuestas para el motor de selección de cartas
            const answersMap: Record<string, OptionKey> = {
              P01: (p01Answer?.key ?? 'A') as OptionKey,
              P02: (p02Answer?.key ?? 'A') as OptionKey,
              P03: (p03Answer?.key ?? 'A') as OptionKey,
              P04: (p04Answer?.key ?? 'A') as OptionKey,
              P05: (p05Answer?.key ?? 'A') as OptionKey,
              P06: (p06Answer?.key ?? 'A') as OptionKey,
              P07: (p07Answer?.key ?? 'A') as OptionKey,
              P08: (p08Answer?.key ?? 'A') as OptionKey,
              P09: (p09Answer?.key ?? 'A') as OptionKey,
              P10: (p10Answer?.key ?? 'A') as OptionKey,
              P11: (p11Answer?.key ?? 'A') as OptionKey,
              P12: (p12Answer?.key ?? 'A') as OptionKey,
              P13: (p13Answer?.key ?? 'A') as OptionKey,
              P14: (p14Answer?.key ?? 'A') as OptionKey,
              P15: answer.key as OptionKey,
            };

            // 2. Calcular la obra ganadora por puntuación total
            const selection = calculateWinningWork(answersMap);

            // 3. Obtener y avanzar la rotación independiente y persistente
            const cardInfo = getAndAdvanceCardForWork(selection.winningWork);

            setSelectedWork(selection.winningWork);
            setSelectedCardNumber(cardInfo.cardNumber);
            setStage('post-p15');
          }}
        />
      )}

      {/* 17. FASE POSTERIOR A P15: VÍDEO DE ELENA + CARTA EDITORIAL */}
      {stage === 'post-p15' && (
        <PostP15Flow
          onResetExperience={handleResetExperience}
          selectedWork={selectedWork ?? 'PP'}
          cardNumber={selectedCardNumber ?? 1}
        />
      )}

      {/* 17B. PANTALLA DIRECTA DE LAS PÁGINAS DE OBRAS */}
      {stage === 'post-p15-exits' && (
        <PostP15Flow
          onResetExperience={handleResetExperience}
          selectedWork={selectedWork ?? 'PP'}
          cardNumber={selectedCardNumber ?? 1}
          initialPhase="three-exits"
          onBackToSelector={() => setStage('works-selector')}
          onSelectExit={(exit) => {
            if (exit === 'all-works') {
              setStage('works-selector');
            } else {
              handleResetExperience();
            }
          }}
        />
      )}

      {/* 17C. SELECTOR DE LAS SEIS OBRAS (PREVIEW NAVEGACIÓN IDA Y VUELTA) */}
      {stage === 'works-selector' && (
        <WorksSelectorScreen
          selectedWork={selectedWork ?? undefined}
          onSelectWork={(workCode) => {
            setSelectedWork(workCode);
            setStage('post-p15-exits');
          }}
          onBackToIntro={handleResetExperience}
        />
      )}

      {/* 18. MODO COMPROBACIÓN VISUAL (EXCLUSIVO DE DESARROLLO/PREVIEW - AISLADO) */}
      {stage === 'visual-checker-selector' && (
        <VisualCheckerSelector
          onSelectCard={(work, cardNum) => {
            setCheckerWork(work);
            setCheckerCardNumber(cardNum);
            setStage('visual-checker-card');
          }}
          onExit={() => setStage('intro-screen')}
        />
      )}

      {stage === 'visual-checker-card' && (
        <PostP15Flow
          key={`checker-${checkerWork}-${checkerCardNumber}`}
          onResetExperience={handleResetExperience}
          selectedWork={checkerWork}
          cardNumber={checkerCardNumber}
          initialPhase="letter-reading"
          onBackToSelector={() => setStage('visual-checker-selector')}
        />
      )}

      {/* 19. MODO VERIFICACIÓN DEL MOTOR DE DECISIÓN (P01-P15 -> OBRA -> CARTA) */}
      {stage === 'decision-verification' && (
        <DecisionVerificationFlow onExit={() => setStage('intro-screen')} />
      )}

      {/* 11. ESCENARIO VÍDEO + VESTÍBULO ESPECÍFICO */}
      {(stage === 'video-playing' || stage === 'vestibulo') && (
        <div className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center overflow-hidden select-none">
          {/* BARRA SUPERIOR DE CONTROL: VOLVER ATRÁS + SELECTOR DE FORMATO PARA PRUEBAS */}
          {(!isCrossfading || isFinished) && (
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
              <button
                type="button"
                onClick={handleResetExperience}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/80 hover:bg-[#181614] text-[#E0D5C7]/90 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
                title="Volver al inicio (o pulsa tecla Escape)"
              >
                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300 text-[#C4B5A5]" />
                <span>Volver al inicio</span>
              </button>

              {/* Selector explícito de formato para verificar cada dispositivo en el preview */}
              <div className="flex items-center bg-[#181614]/85 backdrop-blur-md rounded-full border border-[#3E3833]/70 p-1 text-[11px] gap-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setDeviceMode('desktop')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    deviceMode === 'desktop'
                      ? 'bg-[#3E3833] text-[#FFFFFF] font-medium shadow-sm'
                      : 'text-[#A89E92] hover:text-[#FFFFFF]'
                  }`}
                >
                  🖥 Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('tablet')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    deviceMode === 'tablet'
                      ? 'bg-[#3E3833] text-[#FFFFFF] font-medium shadow-sm'
                      : 'text-[#A89E92] hover:text-[#FFFFFF]'
                  }`}
                >
                  📟 Tablet (3:4)
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('mobile')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    deviceMode === 'mobile'
                      ? 'bg-[#3E3833] text-[#FFFFFF] font-medium shadow-sm'
                      : 'text-[#A89E92] hover:text-[#FFFFFF]'
                  }`}
                >
                  📱 Móvil
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('auto')}
                  className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                    deviceMode === 'auto'
                      ? 'bg-[#3E3833] text-[#FFFFFF] font-medium shadow-sm'
                      : 'text-[#7A7168] hover:text-[#FFFFFF]'
                  }`}
                  title="Detectar automáticamente según proporción de pantalla"
                >
                  Auto
                </button>
              </div>
            </div>
          )}

          {/* A. CAPA DEL VÍDEO DE PRESENTACIÓN (ELENA) */}
          {!isFinished && (
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-[1800ms] ease-out ${
                isCrossfading ? 'opacity-0 blur-[3px] scale-[1.01]' : 'opacity-100 blur-0 scale-100'
              }`}
            >
              {videoError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#EDE7DF] gap-4">
                  <AlertCircle className="w-8 h-8 text-[#E57373]" />
                  <p className="text-sm max-w-md text-[#E0D5C7]/90">{videoError}</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoError(null);
                        setStage('vestibulo');
                        setTransitionPhase('finished');
                      }}
                      className="px-4 py-2 text-xs rounded-lg bg-[#3D352E] text-[#FBF9F5] hover:bg-[#4E443B] transition-colors cursor-pointer"
                    >
                      Continuar al Vestíbulo →
                    </button>
                    <button
                      type="button"
                      onClick={handleResetExperience}
                      className="px-4 py-2 text-xs rounded-lg bg-[#2C2926] text-[#A89E92] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      Volver a la Intro
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center overflow-hidden ${
                    deviceMode === 'desktop'
                      ? 'max-w-[1920px] aspect-[16/9]'
                      : deviceMode === 'tablet'
                      ? 'max-w-[1086px] aspect-[3/4]'
                      : deviceMode === 'mobile'
                      ? 'max-w-[941px] aspect-[9/16]'
                      : ''
                  }`}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    controls={false}
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onVolumeChange={(e) => {
                      setIsMuted(e.currentTarget.muted || e.currentTarget.volume === 0);
                    }}
                    onError={() => {
                      setVideoError('Error reproduciendo el archivo de vídeo en el navegador.');
                    }}
                    onEnded={handleVideoEnded}
                    className={`w-full h-full ${
                      deviceMode === 'desktop'
                        ? 'object-contain object-center'
                        : deviceMode === 'tablet'
                        ? 'object-cover object-[53%_center]'
                        : deviceMode === 'mobile'
                        ? 'object-cover object-[53%_center]'
                        : 'portrait:max-sm:object-cover portrait:max-sm:object-[53%_center] portrait:sm:object-cover portrait:sm:object-[53%_center] landscape:object-contain landscape:object-center'
                    }`}
                  >
                    <source src="/assets/videos/PRESENTACIONWEB.mp4" type="video/mp4" />
                    <source src="/PRESENTACIONWEB.mp4" type="video/mp4" />
                    <source src="/assets/videos/PRESENTACIONWEB-1.mp4" type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
          )}

          {/* B. CAPA DEL VESTÍBULO CON ENLACE «EMPEZAR →» */}
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center overflow-hidden transition-all duration-[1800ms] ease-in-out ${
              isFinished
                ? 'opacity-100 blur-0 pointer-events-auto'
                : isCrossfading
                ? 'opacity-100 blur-0 pointer-events-none'
                : 'opacity-0 blur-[3px] pointer-events-none'
            }`}
          >
            {/* Atmósfera ambiental difuminada */}
            <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
              {deviceMode === 'auto' ? (
                <picture className="w-full h-full">
                  <source media={VESTIBULO_ASSETS.mobile.mediaQuery} srcSet={VESTIBULO_ASSETS.mobile.src} />
                  <source media={VESTIBULO_ASSETS.tablet.mediaQuery} srcSet={VESTIBULO_ASSETS.tablet.src} />
                  <img
                    src={VESTIBULO_ASSETS.desktop.src}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover blur-3xl scale-125 opacity-40 brightness-75"
                  />
                </picture>
              ) : (
                <img
                  src={activeAsset.src}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover blur-3xl scale-125 opacity-40 brightness-75"
                />
              )}
            </div>

            {/* Composición nítida del Vestíbulo con enlace interactivo «Empezar →» */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
              <div
                className={`relative flex items-center justify-center w-full h-full ${
                  deviceMode === 'desktop'
                    ? 'aspect-[16/9] max-w-[1920px]'
                    : deviceMode === 'tablet'
                    ? 'aspect-[3/4] max-w-[1086px]'
                    : deviceMode === 'mobile'
                    ? 'aspect-[9/16] max-w-[941px]'
                    : ''
                }`}
              >
                {deviceMode === 'auto' ? (
                  <picture className="w-full h-full flex items-center justify-center">
                    <source media={VESTIBULO_ASSETS.mobile.mediaQuery} srcSet={VESTIBULO_ASSETS.mobile.src} />
                    <source media={VESTIBULO_ASSETS.tablet.mediaQuery} srcSet={VESTIBULO_ASSETS.tablet.src} />
                    <img
                      src={VESTIBULO_ASSETS.desktop.src}
                      alt="Vestíbulo — La Consulta (Desktop 16:9)"
                      className="w-full h-full max-w-[1920px] aspect-[16/9] object-contain select-none pointer-events-none drop-shadow-2xl"
                      draggable={false}
                    />
                  </picture>
                ) : (
                  <img
                    src={activeAsset.src}
                    alt={activeAsset.name}
                    className={`w-full h-full select-none pointer-events-none object-contain drop-shadow-2xl ${
                      deviceMode === 'desktop' ? 'aspect-[16/9] max-w-[1920px]' : ''
                    } ${deviceMode === 'tablet' ? 'aspect-[3/4] max-w-[1086px]' : ''} ${
                      deviceMode === 'mobile' ? 'aspect-[9/16] max-w-[941px]' : ''
                    }`}
                    draggable={false}
                  />
                )}

                {/* ZONA CLICABLE PARA «EMPEZAR →» EN EL VESTÍBULO */}
                {isFinished && (
                  <button
                    type="button"
                    onClick={() => setStage('p01')}
                    aria-label="Empezar La Consulta (pasar a la pregunta 1)"
                    className="absolute bottom-[4%] left-[24%] right-[24%] h-[8%] rounded-2xl cursor-pointer hover:bg-white/[0.08] hover:ring-1 hover:ring-[#E0D5C7]/50 active:scale-[0.98] transition-all flex items-center justify-center group pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
                  >
                    <span className="sr-only">Empezar La Consulta</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* C. CONTROLES DEL VÍDEO (SOLO ACTIVOS PREVIOS AL CROSSFADE) */}
          {!isCrossfading && !isFinished && (
            <>
              {isMuted && (
                <div className="absolute top-16 left-4 z-30">
                  <button
                    type="button"
                    onClick={unmuteAudio}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E57373] text-white text-xs font-semibold shadow-xl hover:bg-[#D32F2F] transition-all cursor-pointer animate-pulse"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Vídeo silenciado · Pulsa para activar sonido</span>
                  </button>
                </div>
              )}

              <div className="absolute top-16 right-4 z-30">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                  className="p-2.5 rounded-full bg-[#181614]/85 text-[#EDE7DF] backdrop-blur-md border border-[#3E3833]/70 hover:bg-[#181614] transition-all cursor-pointer shadow"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-[#E57373]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#81C784]" />
                  )}
                </button>
              </div>

              {!isSpeakingZone && (
                <div className="absolute bottom-6 right-6 z-30">
                  <button
                    type="button"
                    onClick={jumpToVoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2C2926]/90 backdrop-blur-md border border-[#4D453E] text-[#FBF9F5] hover:bg-[#1A1816] transition-colors cursor-pointer text-xs font-medium shadow-lg"
                  >
                    <FastForward className="w-3.5 h-3.5 text-[#E0D5C7]" />
                    <span>Ir al segundo 08 (inicio voz)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
