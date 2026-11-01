'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Film, AlertCircle, Volume2, VolumeX, FastForward, RotateCcw, ArrowRight, Eye, Compass } from 'lucide-react';
import { QuestionScreen, AnswerRegistration } from '@/components/consultation/QuestionScreen';
import { PostP15Flow } from '@/components/consultation/PostConsultationFlow';
import {
  recognizeStub,
  calculateWinningWork,
  getAndAdvanceCardForWork,
  type EngineAnswer,
  type OptionValue,
  type WorkCode,
  type OptionKey,
} from '@/engine';

type Stage = 'intro-screen' | 'video-playing' | 'p01' | 'p02' | 'p03' | 'p04' | 'p05' | 'p06' | 'p07' | 'p08' | 'p09' | 'p10' | 'p11' | 'p12' | 'p13' | 'p14' | 'p15' | 'post-p15';

type TransitionPhase = 'playing' | 'crossfading';

export function IntroExperience() {
  const [stage, setStage] = useState<Stage>('intro-screen');
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('playing');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(19.3);

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
  const [selectedWork, setSelectedWork] = useState<WorkCode | null>(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState<number | null>(null);

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
      setStage('p01');
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
  return (
    <>
      {stage === 'intro-screen' && (
        <div className="w-full flex flex-col items-center justify-center my-auto min-h-[65vh]">
          <div className="w-full max-w-2xl mx-auto bg-[#FFFFFF] border border-[#E8E1D9] rounded-2xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center gap-6">
            <div className="space-y-4 max-w-lg">
              <span className="text-xs uppercase tracking-widest text-[#9C8F80] font-medium block">La Consulta · Elena Vargas</span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#1F1D1A] tracking-tight">Introducción a la Casa</h1>
              <p className="text-sm sm:text-base text-[#5C544D] font-light leading-relaxed italic">«Hola. Si has llegado hasta aquí, quizá haya algo que te haya traído. No hace falta que sepas exactamente qué. Podemos quedarnos un momento.»</p>
            </div>
            <button type="button" onClick={handleStartVideo} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2C2926] text-[#FBF9F5] text-xs font-medium hover:bg-[#1A1816] transition-all cursor-pointer shadow-sm hover:shadow" title="Reproducir vídeo de presentación">
              <Play className="w-3.5 h-3.5 fill-current" /><span>Ver vídeo</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PREGUNTA P01 */}
      {stage === 'p01' && (
        <QuestionScreen
          questionId="P01"
          deviceMode="auto"
          onBack={handleResetExperience}
          backLabel="Inicio"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP01Answer(answer);
            setStage('p02');
          }}
        />
      )}

      {/* 3. PREGUNTA P02 */}
      {stage === 'p02' && (
        <QuestionScreen
          questionId="P02"
          deviceMode="auto"
          onBack={() => setStage('p01')}
          backLabel="Pregunta 1"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP02Answer(answer);
            setStage('p03');
          }}
        />
      )}

      {/* 4. PREGUNTA P03 */}
      {stage === 'p03' && (
        <QuestionScreen
          questionId="P03"
          deviceMode="auto"
          onBack={() => setStage('p02')}
          backLabel="Pregunta 2"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP03Answer(answer);
            setStage('p04');
          }}
        />
      )}

      {/* 5. PREGUNTA P04 */}
      {stage === 'p04' && (
        <QuestionScreen
          questionId="P04"
          deviceMode="auto"
          onBack={() => setStage('p03')}
          backLabel="Pregunta 3"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP04Answer(answer);
            setStage('p05');
          }}
        />
      )}

      {/* 6. PREGUNTA P05 */}
      {stage === 'p05' && (
        <QuestionScreen
          questionId="P05"
          deviceMode="auto"
          onBack={() => setStage('p04')}
          backLabel="Pregunta 4"
          onResetAll={handleResetExperience}
          onAnswerSelected={(answer) => {
            setP05Answer(answer);
            setStage('p06');
          }}
        />
      )}

      {/* 7. PREGUNTA P06 (TRANSICIÓN DIRECTA A P07) */}
      {stage === 'p06' && (
        <QuestionScreen
          questionId="P06"
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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
          deviceMode="auto"
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

      {stage === 'video-playing' && (
        <div className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center overflow-hidden select-none">
          {!isCrossfading && <div className="absolute top-4 left-4 z-40"><button type="button" onClick={handleResetExperience} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/80 text-[#E0D5C7]/90 text-xs border border-[#3E3833]/70" title="Volver al inicio"><RotateCcw className="w-3.5 h-3.5" /><span>Volver al inicio</span></button></div>}
          <div className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-[1800ms] ease-out ${isCrossfading ? 'opacity-0 blur-[3px] scale-[1.01]' : 'opacity-100 blur-0 scale-100'}`}>
            {videoError ? <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#EDE7DF] gap-4"><AlertCircle className="w-8 h-8 text-[#E57373]" /><p className="text-sm max-w-md">{videoError}</p><div className="flex items-center gap-3"><button type="button" onClick={handleStartVideo} className="px-4 py-2 text-xs rounded-lg bg-[#3D352E]">Reintentar vídeo</button><button type="button" onClick={() => setStage('p01')} className="px-4 py-2 text-xs rounded-lg bg-[#2C2926]">Continuar</button></div></div> : <video ref={videoRef} playsInline autoPlay controls={false} preload="auto" onTimeUpdate={handleTimeUpdate} onVolumeChange={(e) => setIsMuted(e.currentTarget.muted || e.currentTarget.volume === 0)} onError={() => setVideoError('Error reproduciendo el archivo de vídeo en el navegador.')} onEnded={handleVideoEnded} className="w-full h-full object-contain"><source src="/assets/videos/PRESENTACIONWEB.mp4" type="video/mp4" /><source src="/PRESENTACIONWEB.mp4" type="video/mp4" /><source src="/assets/videos/PRESENTACIONWEB-1.mp4" type="video/mp4" /></video>}
          </div>
          {!isCrossfading && !videoError && <><div className="absolute top-16 left-4 z-30">{isMuted && <button type="button" onClick={unmuteAudio} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E57373] text-white text-xs"><VolumeX className="w-4 h-4" /><span>Vídeo silenciado · Pulsa para activar sonido</span></button>}</div><div className="absolute top-16 right-4 z-30"><button type="button" onClick={toggleMute} aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'} className="p-2.5 rounded-full bg-[#181614]/85 text-[#EDE7DF] border border-[#3E3833]/70">{isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button></div></>}
        </div>
      )}

    </>
  );
}
