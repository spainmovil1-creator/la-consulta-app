'use client';

import { publicAssetPath } from '@/lib/utils';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, ArrowLeft } from 'lucide-react';
import type { WorkCode } from '@/engine/selectionEngine';
import { WORKS_METADATA } from '@/engine/selectionEngine';
import { getCardForWork } from '@/content/cards';
import {
  ThreeExitsScreen,
  type ExitChoice,
  BOOK_MOCKUP_PATH,
} from './ThreeExitsScreen';

export type { ExitChoice };

const LETTER_MUSIC_PATH = publicAssetPath('/audio/mixkit-wedding-01-657.mp3');
const TARGET_MUSIC_VOLUME = 0.22;

export interface PostP15FlowProps {
  onResetExperience: () => void;
  selectedWork?: WorkCode;
  cardNumber?: number;
  initialPhase?: 'p15-transition' | 'elena-video' | 'video-to-letter' | 'letter-reading' | 'elena-video-2' | 'three-exits';
  onBackToSelector?: () => void;
  onSelectExit?: (exit: ExitChoice, workCode: WorkCode) => void;
}

// 8 bloques editoriales de la carta + bloque 9 final
interface LetterBlockDef {
  id: number;
  type: 'title' | 'scene' | 'single' | 'list' | 'climax' | 'prompt' | 'final';
  lines: string[];
  emptyPauseBeforeMs?: number; // Pausa / instante de vacío antes de revelarse
}

const LETTER_SEQUENCE: LetterBlockDef[] = [
  {
    id: 0,
    type: 'title',
    lines: ['Cuando termina el día, pero no termina'],
  },
  {
    id: 1,
    type: 'scene',
    lines: [
      'Sales del trabajo.',
      'Cierras el ordenador, coges el bolso y te vas.',
    ],
  },
  {
    id: 2,
    type: 'single',
    lines: ['Y, sin embargo, hay algo que se viene contigo.'],
    emptyPauseBeforeMs: 400,
  },
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
    lines: [
      'Llegas a casa.',
      'Haces la cena.',
      'Hablas con alguien.',
      'Te sientas un rato.',
    ],
    emptyPauseBeforeMs: 500, // Pausa trabajo -> casa
  },
  {
    id: 5,
    type: 'climax',
    lines: ['Pero aquello sigue ahí.'],
    emptyPauseBeforeMs: 600, // Momento con espacio propio
  },
  {
    id: 6,
    type: 'single',
    lines: ['Lo curioso es que quizá nadie te esté pidiendo que pienses en ello.'],
  },
  {
    id: 7,
    type: 'single',
    lines: ['Eres tú la que sigue llevándoselo a casa.'],
  },
  {
    id: 8,
    type: 'single',
    lines: ['Y puede que lleves tanto tiempo haciéndolo que ya ni siquiera te des cuenta de cuándo empieza.'],
    emptyPauseBeforeMs: 400,
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
    emptyPauseBeforeMs: 500,
  },
  {
    id: 11,
    type: 'final',
    lines: [
      'Y quizá, alguna tarde, descubras que una de esas cosas puede esperar hasta mañana.',
      'Sin que pase nada.',
      'Sin que tengas que llevártela contigo.',
    ],
    emptyPauseBeforeMs: 800,
  },
];

type FlowPhase =
  | 'p15-transition' // Retirada suave de P15, fondo continuo (#16110D)
  | 'elena-video'    // Reproducción del primer vídeo de Elena
  | 'video-to-letter'// Secuencia de apertura: «Ya está.» -> «Gracias por quedarte hasta aquí.»
  | 'letter-reading' // Lectura interactiva bloque a bloque
  | 'elena-video-2'  // Fase B: Vídeo de Elena tras la carta (elenasillon2.mp4)
  | 'three-exits';   // Fase C: Pantalla de las tres salidas con voces secuenciales

type OpeningPhrase = 'ya-esta' | 'gracias';

export function PostP15Flow({
  onResetExperience,
  selectedWork = 'PP',
  cardNumber = 1,
  initialPhase = 'p15-transition',
  onBackToSelector,
  onSelectExit,
}: PostP15FlowProps) {
  const [phase, setPhase] = useState<FlowPhase>(initialPhase);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Estados para la Fase B: Vídeo de Elena 2 (elenasillon2.mp4)
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const [isVideo2Muted, setIsVideo2Muted] = useState(false);
  const [isVideo2Playing, setIsVideo2Playing] = useState(false);
  const [video2Ended, setVideo2Ended] = useState(false);
  const [video2Error, setVideo2Error] = useState(false);

  // Carta activa seleccionada por el motor de rotación
  const currentCard = useMemo(() => {
    return getCardForWork(selectedWork, cardNumber);
  }, [selectedWork, cardNumber]);

  const letterBlocks = currentCard.blocks;

  // Estados de la secuencia narrativa entre vídeo y carta
  const [openingPhrase, setOpeningPhrase] = useState<OpeningPhrase>('ya-esta');
  const [openingOpacity, setOpeningOpacity] = useState(1);
  const [showOpeningCue, setShowOpeningCue] = useState(false);

  // Estados de los bloques de la carta
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [advanceUnlockedAt, setAdvanceUnlockedAt] = useState<number>(0);
  const [showAdvanceCue, setShowAdvanceCue] = useState(false);

  // Música instrumental de fondo para las 30 Cartas (mixkit-wedding-01-657.mp3)
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicFadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedMusicRef = useRef(false);
  const userMutedPreferenceRef = useRef(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const lastTouchTimeRef = useRef<number>(0);

  // Limpiar temporizador de fundido de música
  const clearMusicFadeTimer = useCallback(() => {
    if (musicFadeTimerRef.current) {
      clearInterval(musicFadeTimerRef.current);
      musicFadeTimerRef.current = null;
    }
  }, []);

  // Transición suave de volumen de música
  const fadeMusicVolume = useCallback(
    (
      audio: HTMLAudioElement,
      fromVol: number,
      toVol: number,
      durationMs: number,
      onComplete?: () => void
    ) => {
      clearMusicFadeTimer();
      const intervalMs = 40;
      const steps = Math.max(1, Math.round(durationMs / intervalMs));
      let stepCount = 0;
      audio.volume = Math.max(0, Math.min(1, fromVol));

      musicFadeTimerRef.current = setInterval(() => {
        stepCount++;
        const progress = Math.min(1, stepCount / steps);
        const current = fromVol + (toVol - fromVol) * progress;
        audio.volume = Math.max(0, Math.min(1, current));

        if (progress >= 1) {
          clearMusicFadeTimer();
          if (onComplete) onComplete();
        }
      }, intervalMs);
    },
    [clearMusicFadeTimer]
  );

  // Inicio de la música de la carta: vinculado al gesto real que inicia la lectura
  const startLetterMusic = useCallback(() => {
    if (hasStartedMusicRef.current && musicRef.current) {
      return;
    }

    let audio = musicRef.current;
    if (!audio) {
      audio = new Audio(LETTER_MUSIC_PATH);
      audio.loop = true;
      audio.preload = 'auto';
      musicRef.current = audio;
    }

    audio.loop = true;
    hasStartedMusicRef.current = true;

    if (userMutedPreferenceRef.current) {
      audio.muted = true;
      audio.volume = 0;
    } else {
      audio.muted = false;
      audio.volume = 0;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!userMutedPreferenceRef.current) {
            fadeMusicVolume(audio, 0, TARGET_MUSIC_VOLUME, 1800);
          }
        })
        .catch((err) => {
          console.warn('Reproducción de música de la carta en espera:', err);
        });
    }
  }, [fadeMusicVolume]);

  // Detención progresiva de la música al terminar la carta
  const stopLetterMusicProgressively = useCallback(
    (durationMs = 900) => {
      const audio = musicRef.current;
      if (!audio) return;
      fadeMusicVolume(audio, audio.volume, 0, durationMs, () => {
        audio.pause();
        audio.currentTime = 0;
      });
    },
    [fadeMusicVolume]
  );

  // Detención inmediata y limpieza de música
  const stopLetterMusicImmediate = useCallback(() => {
    clearMusicFadeTimer();
    const audio = musicRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      musicRef.current = null;
    }
    hasStartedMusicRef.current = false;
  }, [clearMusicFadeTimer]);

  // Control para silenciar / reactivar sonido
  const toggleMusicMute = useCallback(() => {
    const audio = musicRef.current;
    const newMuted = !isMusicMuted;
    userMutedPreferenceRef.current = newMuted;
    setIsMusicMuted(newMuted);

    if (!audio) {
      return;
    }

    if (newMuted) {
      fadeMusicVolume(audio, audio.volume, 0, 300, () => {
        audio.muted = true;
      });
    } else {
      audio.muted = false;
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      fadeMusicVolume(audio, audio.volume, TARGET_MUSIC_VOLUME, 400);
    }
  }, [isMusicMuted, fadeMusicVolume]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      stopLetterMusicImmediate();
    };
  }, [stopLetterMusicImmediate]);

  // Asegurar que la música de la carta nunca suene en vídeos ni en la página final
  useEffect(() => {
    if (phase === 'elena-video-2') {
      const timer = setTimeout(() => {
        if (musicRef.current && !musicRef.current.paused) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
        }
      }, 950);
      return () => clearTimeout(timer);
    }
    if (phase === 'three-exits' || phase === 'elena-video' || phase === 'p15-transition') {
      stopLetterMusicImmediate();
    }
  }, [phase, stopLetterMusicImmediate]);

  // Intentar reproducir el vídeo con audio, o silenciado si el navegador bloquea autoplay
  const tryPlayVideo = useCallback((unmute = false) => {
    const vid = videoRef.current;
    if (!vid) return;

    if (unmute) {
      vid.muted = false;
      setIsVideoMuted(false);
    }

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStartedPlayback(true);
        })
        .catch((err) => {
          console.warn('Autoplay bloqueado con audio, reproduciendo en silencio:', err);
          vid.muted = true;
          setIsVideoMuted(true);
          vid.play()
            .then(() => {
              setIsPlaying(true);
              setHasStartedPlayback(true);
            })
            .catch((e) => {
              console.warn('Reproducción en espera de interacción táctil:', e);
              setIsPlaying(false);
            });
        });
    }
  }, []);

  // Precarga anticipada del mockup de «El peso que no se ve» durante la carta y vídeo de Elena
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = BOOK_MOCKUP_PATH;
    if (img.decode) {
      img.decode().catch(() => {});
    }
  }, []);

  // 1. Al montar (P15 completada), transición suave al vídeo de Elena (solo en recorrido normal)
  useEffect(() => {
    if (initialPhase !== 'p15-transition') return;

    const startTimer = setTimeout(() => {
      tryPlayVideo(false);
    }, 50);

    const transitionTimer = setTimeout(() => {
      setPhase('elena-video');
      tryPlayVideo(false);
    }, 600); // 600ms de transición continua sobre el fondo #16110D

    return () => {
      clearTimeout(startTimer);
      clearTimeout(transitionTimer);
    };
  }, [initialPhase, tryPlayVideo]);

  // Transición cuando termina el vídeo de Elena
  const handleVideoEnded = useCallback(() => {
    if (videoEnded) return;
    setVideoEnded(true);

    // Iniciar secuencia de apertura de la carta (silencio en ambos mensajes)
    setPhase('video-to-letter');
    setOpeningPhrase('ya-esta');
    setOpeningOpacity(1);

    // 1. «Ya está.» permanece brevemente y luego da paso a «Gracias por quedarte hasta aquí.»
    const t1 = setTimeout(() => {
      setOpeningPhrase('gracias');
    }, 2200);

    return () => {
      clearTimeout(t1);
    };
  }, [videoEnded]);

  // Indicador de avance sutil en el segundo mensaje («Gracias por quedarte hasta aquí.»)
  useEffect(() => {
    if (phase === 'video-to-letter' && openingPhrase === 'gracias') {
      const cueTimer = setTimeout(() => {
        setShowOpeningCue(true);
      }, 1600);
      return () => clearTimeout(cueTimer);
    } else {
      setShowOpeningCue(false);
    }
  }, [phase, openingPhrase]);

  // Interacción durante la secuencia de apertura:
  // - En «Ya está.»: avanza a «Gracias por quedarte hasta aquí.» (silencio)
  // - En «Gracias por quedarte hasta aquí.»: la persona realiza el gesto que inicia la lectura: comienza la música y entra el primer bloque
  const handleSkipOpening = useCallback(() => {
    if (phase === 'video-to-letter') {
      if (openingPhrase === 'ya-esta') {
        setOpeningPhrase('gracias');
      } else {
        startLetterMusic();
        setPhase('letter-reading');
        setCurrentBlockIndex(0);
        setAdvanceUnlockedAt(Date.now() + 1000);
      }
    }
  }, [phase, openingPhrase, startLetterMusic]);

  // Clic/interacción en la fase de vídeo
  const handleVideoInteraction = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      tryPlayVideo(true);
    } else if (vid.muted) {
      vid.muted = false;
      setIsVideoMuted(false);
    }
  }, [tryPlayVideo]);

  // Intentar reproducir el vídeo 2 de Elena (elenasillon2.mp4)
  const tryPlayVideo2 = useCallback((unmute = false) => {
    const vid = video2Ref.current;
    if (!vid) return;

    if (unmute) {
      vid.muted = false;
      setIsVideo2Muted(false);
    }

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideo2Playing(true);
        })
        .catch((err) => {
          console.warn('Autoplay bloqueado con audio en vídeo 2, reproduciendo en silencio:', err);
          vid.muted = true;
          setIsVideo2Muted(true);
          vid
            .play()
            .then(() => setIsVideo2Playing(true))
            .catch(() => setIsVideo2Playing(false));
        });
    }
  }, []);

  const hasElena2EndedRef = useRef(false);

  // Transición cuando termina el vídeo 2 de Elena -> Entrada en Fase C (las tres salidas)
  const handleElena2Ended = useCallback(() => {
    if (hasElena2EndedRef.current) return;
    hasElena2EndedRef.current = true;
    setVideo2Ended(true);
    setPhase('three-exits');
  }, []);

  // Si se monta en elena-video-2 o se transiciona hacia ella, iniciar reproducción
  useEffect(() => {
    if (phase === 'elena-video-2') {
      hasElena2EndedRef.current = false;
      const timer = setTimeout(() => {
        tryPlayVideo2(false);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [phase, tryPlayVideo2]);

  // Avance entre bloques de lectura (clic, toque, Espacio, Enter)
  const handleAdvanceBlock = useCallback(() => {
    if (phase !== 'letter-reading' || !currentCard.isDefinitive) return;
    if (Date.now() < advanceUnlockedAt) return;

    // Al terminar el bloque final de la carta -> Detener la música progresivamente y avanzar al vídeo 2
    if (currentBlockIndex >= letterBlocks.length - 1) {
      stopLetterMusicProgressively(900);
      hasElena2EndedRef.current = false;
      setVideo2Ended(false);
      setPhase('elena-video-2');
      return;
    }

    const nextIndex = currentBlockIndex + 1;
    const nextBlock = letterBlocks[nextIndex];
    const pauseBefore = nextBlock?.emptyPauseBeforeMs ?? 0;
    const enterDuration = nextBlock?.type === 'climax' ? 1400 : nextBlock?.type === 'final' ? 1600 : 1000;
    const totalTransitionTime = 800 + pauseBefore + enterDuration;

    setShowAdvanceCue(false);
    setCurrentBlockIndex(nextIndex);
    const unlockDelay = Math.min(totalTransitionTime, 1200);
    setAdvanceUnlockedAt(Date.now() + unlockDelay);
  }, [phase, advanceUnlockedAt, currentBlockIndex, letterBlocks, currentCard.isDefinitive, stopLetterMusicProgressively]);

  // Temporizador para mostrar sutilmente el indicador de lectura (incluso en el bloque final para avanzar al vídeo de Elena)
  useEffect(() => {
    if (phase !== 'letter-reading' || !currentCard.isDefinitive) return;

    const block = letterBlocks[currentBlockIndex];
    const pauseBefore = block?.emptyPauseBeforeMs ?? 0;
    const enterDuration = block?.type === 'climax' ? 1400 : block?.type === 'final' ? 1600 : 1000;
    const cueDelay = (currentBlockIndex === 0 ? 0 : 600) + pauseBefore + enterDuration + 1000;

    const timer = setTimeout(() => {
      setShowAdvanceCue(true);
    }, cueDelay);

    return () => clearTimeout(timer);
  }, [phase, currentBlockIndex, letterBlocks, currentCard.isDefinitive]);

  // Interacción global unificada (clic/toque en cualquier punto)
  const handleContainerClick = () => {
    if (phase === 'elena-video' || phase === 'p15-transition') {
      handleVideoInteraction();
    } else if (phase === 'video-to-letter') {
      handleSkipOpening();
    } else if (phase === 'letter-reading') {
      if (!hasStartedMusicRef.current && !userMutedPreferenceRef.current) {
        startLetterMusic();
      }
      if (currentCard.isDefinitive) {
        handleAdvanceBlock();
      }
    } else if (phase === 'elena-video-2') {
      const vid = video2Ref.current;
      if (vid) {
        if (vid.paused) {
          tryPlayVideo2(true);
        } else if (vid.muted) {
          vid.muted = false;
          setIsVideo2Muted(false);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();
    const target = e.target as HTMLElement | null;
    if (target?.closest('button') || target?.closest('[data-no-advance]')) {
      return;
    }
    handleContainerClick();
  };

  // Soporte para teclado (Espacio o Enter para avanzar, Escape para salir)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onBackToSelector) {
          onBackToSelector();
        } else {
          onResetExperience();
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (phase === 'letter-reading' && !currentCard.isDefinitive) {
          return;
        }
        e.preventDefault();
        handleContainerClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const currentBlock = letterBlocks[currentBlockIndex] || letterBlocks[0] || LETTER_SEQUENCE[0];

  return (
    <div
      data-flow-container
      onClick={(e) => {
        if (Date.now() - lastTouchTimeRef.current < 400 && e.type === 'click') {
          return;
        }
        handleContainerClick();
      }}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center overflow-hidden select-none cursor-default"
    >
      {/* Atmósfera de fondo continua idéntica a La Consulta (#16110D) */}
      <div className="absolute inset-0 bg-[#16110D] pointer-events-none" />

      {/* Control discreto de salida / reinicio en esquina superior izquierda */}
      <div className="absolute top-4 left-4 z-50 pointer-events-auto flex items-center gap-2.5">
        {onBackToSelector ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBackToSelector();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C2117]/90 hover:bg-[#3D2F22] text-[#F0E6D9] text-xs font-serif backdrop-blur-md border border-[#5A4535] transition-all cursor-pointer shadow-lg hover:text-[#FFFFFF]"
            title="Volver al selector de cartas (Modo comprobación)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E0D5C7]" />
            <span>Volver al selector</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResetExperience();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/80 hover:bg-[#181614] text-[#E0D5C7]/80 hover:text-[#FFFFFF] text-xs font-serif backdrop-blur-md border border-[#3E3833]/60 transition-all cursor-pointer shadow-lg"
            title="Volver al inicio"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C4B5A5]" />
            <span>Inicio</span>
          </button>
        )}

        {onBackToSelector && (
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#1F1914]/80 border border-[#3E3228] text-[11px] font-serif text-[#C4B5A5] tracking-wide">
            Modo Comprobación · {WORKS_METADATA[selectedWork]?.title || selectedWork} (Carta {cardNumber} de 5)
          </span>
        )}
      </div>

      {/* Control discreto de música de fondo durante la lectura de la carta */}
      {phase === 'letter-reading' && (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMusicMute();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/80 hover:bg-[#181614] text-[#E0D5C7] text-xs font-serif backdrop-blur-md border border-[#3E3833]/60 transition-all cursor-pointer shadow-lg hover:text-[#FFFFFF]"
            title={isMusicMuted ? 'Activar música de fondo' : 'Silenciar música de fondo'}
            aria-label={isMusicMuted ? 'Activar música de fondo' : 'Silenciar música de fondo'}
          >
            {isMusicMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#C4B5A5]" />
                <span className="hidden sm:inline">Activar música</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#E0D5C7]" />
                <span className="hidden sm:inline">Silenciar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 1. CAPA DE VÍDEO DE ELENA */}
      {(phase === 'p15-transition' || phase === 'elena-video') && (
        <motion.div
          key="elena-video-layer"
          initial={{ opacity: 0 }}
          animate={{
            opacity: phase === 'elena-video' ? 1 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {/* Fondo ambiental sutil en móvil para suavizar bordes sin bandas negras */}
          <div
            aria-hidden="true"
            className="hidden portrait:block absolute -inset-8 overflow-hidden filter blur-2xl brightness-75 opacity-70 pointer-events-none select-none scale-110"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicAssetPath("/assets/images/elena1_ambient.jpg")}
              alt=""
              className="w-full h-full object-cover object-[64%_center]"
            />
          </div>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            preload="auto"
            muted={isVideoMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                const { currentTime, duration } = videoRef.current;
                if (duration > 0 && currentTime >= duration - 0.25) {
                  handleVideoEnded();
                }
              }
            }}
            onCanPlay={() => {
              if (!hasStartedPlayback) {
                tryPlayVideo(false);
              }
            }}
            onEnded={handleVideoEnded}
            className="relative z-10 w-full h-full select-none portrait:h-[91%] portrait:w-full portrait:object-cover portrait:object-[64%_center] portrait:translate-y-[2%] landscape:w-full landscape:h-full landscape:object-contain landscape:object-center max-w-[1920px] max-h-[1080px]"
          >
            <source src={publicAssetPath("/assets/videos/ELENASILLON_processed%20(1).mp4")} type="video/mp4" />
            <source src={publicAssetPath("/assets/videos/ELENASILLON_processed (1).mp4")} type="video/mp4" />
          </video>

          {/* Indicador discreto si el navegador bloqueó la reproducción automática */}
          {!isPlaying && phase === 'elena-video' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer pointer-events-auto"
              onClick={handleVideoInteraction}
            >
              <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-[#181614]/90 border border-[#3E3833] text-[#E0D5C7] shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#E0D5C7]/10 flex items-center justify-center text-[#FFFFFF]">
                  <svg className="w-6 h-6 ml-0.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-sm font-serif tracking-wide text-[#E0D5C7]/90">
                  Toca para reproducir
                </span>
              </div>
            </motion.div>
          )}

          {/* Aviso / botón sutil de activar sonido cuando el navegador silencia por política de autoplay */}
          {isPlaying && isVideoMuted && phase === 'elena-video' && (
            <div className="absolute bottom-6 left-6 z-40 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsVideoMuted(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181614]/90 hover:bg-[#181614] text-[#E0D5C7] text-xs font-serif backdrop-blur-md border border-[#3E3833]/80 transition-all cursor-pointer shadow-lg animate-pulse"
              >
                <VolumeX className="w-4 h-4 text-[#C4B5A5]" />
                <span>Activar sonido</span>
              </button>
            </div>
          )}

          {/* Control sutil de volumen en esquina inferior derecha */}
          <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  const newMuted = !videoRef.current.muted;
                  videoRef.current.muted = newMuted;
                  setIsVideoMuted(newMuted);
                }
              }}
              className="p-3 rounded-full bg-[#181614]/80 hover:bg-[#181614] text-[#E0D5C7] backdrop-blur-md border border-[#3E3833]/60 transition-all cursor-pointer shadow-lg"
              title={isVideoMuted ? 'Activar sonido' : 'Silenciar'}
              aria-label={isVideoMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isVideoMuted ? (
                <VolumeX className="w-4 h-4 text-[#C4B5A5]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#E0D5C7]" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. SECUENCIA DE APERTURA: «Ya está.» -> «Gracias por quedarte hasta aquí.» */}
      {phase === 'video-to-letter' && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {openingPhrase === 'ya-esta' ? (
              <motion.p
                key="ya-esta-phrase"
                initial={{ opacity: 0 }}
                animate={{ opacity: openingOpacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#E8DFD5] font-light tracking-wide italic"
              >
                «Ya está.»
              </motion.p>
            ) : (
              <motion.p
                key="gracias-phrase"
                initial={{ opacity: 0 }}
                animate={{ opacity: openingOpacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-xl sm:text-2xl md:text-3xl text-[#E8DFD5] font-light tracking-wide italic"
              >
                «Gracias por quedarte hasta aquí.»
              </motion.p>
            )}
          </AnimatePresence>

          {/* Sutil indicador de inicio de lectura */}
          <AnimatePresence>
            {showOpeningCue && (
              <motion.div
                key="opening-cue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bottom-6 md:bottom-8 left-0 right-0 mx-auto text-center text-[11px] sm:text-xs font-serif text-[#A89A8A] tracking-wider pointer-events-none select-none"
              >
                pulsa para leer la carta
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3A. LECTURA DE LA CARTA DEFINITIVA: BLOQUE A BLOQUE CON PERMANENCIA Y AIRE EDITORIAL */}
      {phase === 'letter-reading' && currentCard.isDefinitive && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden select-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`block-${currentBlock.id}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: currentBlock.type === 'climax' ? 1.4 : currentBlock.type === 'final' ? 1.6 : 1.0,
                  delay: (currentBlock.emptyPauseBeforeMs ?? 0) / 1000,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className="max-w-2xl mx-auto w-full text-center px-4 md:px-8 py-8 flex flex-col items-center justify-center"
            >
              {/* TÍTULO */}
              {currentBlock.type === 'title' && (
                <div className="space-y-4">
                  <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FFFFFF] font-normal tracking-tight leading-snug drop-shadow-sm">
                    {currentBlock.lines[0]}
                  </h1>
                </div>
              )}

              {/* ESCENA O CONJUNTO */}
              {currentBlock.type === 'scene' && (
                <div className="space-y-3 font-serif text-xl sm:text-2xl md:text-3xl text-[#F2ECE4] leading-relaxed md:leading-[1.7] tracking-normal font-light">
                  {currentBlock.lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}

              {/* FRASE INDEPENDIENTE / REFLEXIÓN */}
              {currentBlock.type === 'single' && (
                <p className="font-serif text-xl sm:text-2xl md:text-3xl text-[#F2ECE4] leading-relaxed md:leading-[1.65] tracking-normal font-light">
                  {currentBlock.lines[0]}
                </p>
              )}

              {/* BLOQUE 3: LO QUE SE VIENE CONTIGO (CONJUNTO COMPLETO) */}
              {currentBlock.type === 'list' && (
                <div className="space-y-3.5 font-serif text-lg sm:text-xl md:text-2xl text-[#E8DFD5] leading-relaxed font-light">
                  {currentBlock.lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}

              {/* BLOQUE 5: EL GOLPE («Pero aquello sigue ahí.») */}
              {currentBlock.type === 'climax' && (
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FFFFFF] font-normal tracking-wide leading-relaxed drop-shadow-sm">
                  {currentBlock.lines[0]}
                </p>
              )}

              {/* BLOQUE 8: PREPARACIÓN DE LA PREGUNTA */}
              {currentBlock.type === 'prompt' && (
                <p className="font-serif text-xl sm:text-2xl md:text-3xl text-[#E0D5C7] leading-relaxed font-light italic">
                  {currentBlock.lines[0]}
                </p>
              )}

              {/* BLOQUE FINAL (MÁXIMA PRESENCIA Y PERMANENCIA INDEFINIDA) */}
              {currentBlock.type === 'final' && (
                <div className="max-w-2xl px-2 space-y-3.5">
                  {currentBlock.lines.map((line, idx) => (
                    <p
                      key={idx}
                      className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FFFFFF] font-normal leading-relaxed md:leading-[1.45] tracking-normal drop-shadow-md"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sutil recordatorio de avance posicionado de forma fija y absoluta en la parte inferior para no alterar jamás la altura ni la posición vertical del texto */}
          <AnimatePresence>
            {showAdvanceCue && (
              <motion.div
                key="advance-cue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-6 md:bottom-8 left-0 right-0 mx-auto text-center text-[11px] sm:text-xs font-serif text-[#A89A8A] tracking-wider pointer-events-none select-none"
              >
                pulsa para continuar
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3B. PANTALLA DE ESTADO EDITORIAL PARA POSICIÓN PENDIENTE */}
      {phase === 'letter-reading' && !currentCard.isDefinitive && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 1.0,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            className="max-w-2xl mx-auto w-full text-center px-4 md:px-8 py-8 flex flex-col items-center justify-center space-y-6"
          >
            {/* Título canónico de la obra seleccionada */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FFFFFF] font-normal tracking-tight leading-snug drop-shadow-sm">
              {currentCard.title}
            </h1>

            {/* Número de carta seleccionado */}
            <p className="font-serif text-sm sm:text-base text-[#A89A8A] tracking-wider uppercase font-light">
              Carta {currentCard.cardNumber} de 5
            </p>

            {/* Mensaje informativo autorizado */}
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-[#E8DFD5] leading-relaxed font-light max-w-xl mx-auto">
              Esta consulta ha determinado esta obra. El texto editorial de esta carta se encuentra en proceso de incorporación definitiva en el catálogo.
            </p>

            {/* Opción funcional para volver al inicio o al selector */}
            <div className="pt-4 pointer-events-auto flex flex-wrap items-center justify-center gap-3">
              {onBackToSelector ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBackToSelector();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C2117]/90 hover:bg-[#3D2F22] text-[#F0E6D9] text-sm font-serif backdrop-blur-md border border-[#5A4535] transition-all cursor-pointer shadow-lg hover:text-[#FFFFFF]"
                >
                  <ArrowLeft className="w-4 h-4 text-[#E0D5C7]" />
                  <span>Volver al selector de cartas</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetExperience();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181614]/90 hover:bg-[#181614] text-[#E0D5C7] text-sm font-serif backdrop-blur-md border border-[#3E3833]/80 transition-all cursor-pointer shadow-lg hover:text-[#FFFFFF]"
                >
                  <RotateCcw className="w-4 h-4 text-[#C4B5A5]" />
                  <span>Volver al inicio</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. CAPA DE VÍDEO DE ELENA TRAS LA CARTA (elenasillon2.mp4) */}
      {phase === 'elena-video-2' && (
        <motion.div
          key="elena-video-2-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden z-20 bg-[#181614]"
        >
          {/* Fondo ambiente sutil para móvil portrait que elimina bandas negras y suaviza el encuadre */}
          <div
            aria-hidden="true"
            className="hidden portrait:block absolute -inset-8 overflow-hidden filter blur-2xl brightness-75 opacity-70 pointer-events-none select-none scale-110"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicAssetPath("/assets/images/elena2_ambient.jpg")}
              alt=""
              className="w-full h-full object-cover object-[56.5%_center]"
            />
          </div>

          <video
            ref={video2Ref}
            autoPlay
            playsInline
            preload="auto"
            muted={isVideo2Muted}
            onPlay={() => setIsVideo2Playing(true)}
            onPause={() => setIsVideo2Playing(false)}
            onTimeUpdate={() => {
              if (video2Ref.current) {
                const { currentTime, duration } = video2Ref.current;
                if (duration > 0 && currentTime >= duration - 0.25) {
                  handleElena2Ended();
                }
              }
            }}
            onCanPlay={() => {
              tryPlayVideo2(false);
            }}
            onEnded={handleElena2Ended}
            onError={(e) => {
              console.error('Error cargando elenasillon2.mp4:', e);
              setVideo2Error(true);
              handleElena2Ended();
            }}
            className="relative z-10 w-full h-full select-none portrait:h-[91%] portrait:w-full portrait:object-cover portrait:object-[56.5%_15%] portrait:translate-y-[1.5%] landscape:w-full landscape:h-full landscape:object-contain landscape:object-center max-w-[1920px] max-h-[1080px]"
          >
            <source src={publicAssetPath("/assets/videos/elenasillon2.mp4")} type="video/mp4" />
            <source src={publicAssetPath("/elenasillon2.mp4")} type="video/mp4" />
          </video>

          {/* Indicador discreto si el navegador bloqueó la reproducción automática del vídeo 2 */}
          {!isVideo2Playing && !video2Ended && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                tryPlayVideo2(true);
              }}
            >
              <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-[#181614]/90 border border-[#3E3833] text-[#E0D5C7] shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#E0D5C7]/10 flex items-center justify-center text-[#FFFFFF]">
                  <svg className="w-6 h-6 ml-0.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-sm font-serif tracking-wide text-[#E0D5C7]/90">
                  Toca para reproducir
                </span>
              </div>
            </motion.div>
          )}

          {/* Aviso / botón sutil de activar sonido cuando el navegador silencia por política de autoplay */}
          {isVideo2Playing && isVideo2Muted && (
            <div className="absolute bottom-6 left-6 z-40 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (video2Ref.current) {
                    video2Ref.current.muted = false;
                    setIsVideo2Muted(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181614]/90 hover:bg-[#181614] text-[#E0D5C7] text-xs font-serif backdrop-blur-md border border-[#3E3833]/80 transition-all cursor-pointer shadow-lg animate-pulse"
              >
                <VolumeX className="w-4 h-4 text-[#C4B5A5]" />
                <span>Activar sonido</span>
              </button>
            </div>
          )}

          {/* Control sutil de volumen en esquina inferior derecha */}
          <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (video2Ref.current) {
                  const newMuted = !video2Ref.current.muted;
                  video2Ref.current.muted = newMuted;
                  setIsVideo2Muted(newMuted);
                }
              }}
              className="p-3 rounded-full bg-[#181614]/80 hover:bg-[#181614] text-[#E0D5C7] backdrop-blur-md border border-[#3E3833]/60 transition-all cursor-pointer shadow-lg"
              title={isVideo2Muted ? 'Activar sonido' : 'Silenciar'}
              aria-label={isVideo2Muted ? 'Activar sonido' : 'Silenciar'}
            >
              {isVideo2Muted ? (
                <VolumeX className="w-4 h-4 text-[#C4B5A5]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#E0D5C7]" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* 5. PÁGINA EDITORIAL DE LA OBRA */}
      {phase === 'three-exits' && (
        <ThreeExitsScreen
          key={`three-exits-${selectedWork}`}
          selectedWork={selectedWork}
          onSelectExit={(exit, work) => {
            if (exit === 'all-works' && onBackToSelector) {
              onBackToSelector();
            } else if (onSelectExit) {
              onSelectExit(exit, work);
            } else {
              onResetExperience();
            }
          }}
          onResetExperience={onResetExperience}
          onBackToWorksSelector={onBackToSelector}
        />
      )}
    </div>
  );
}
