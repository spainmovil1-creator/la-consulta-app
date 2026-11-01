'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { WorkCode } from '@/engine/selectionEngine';
import {
  RotateCcw,
  ArrowLeft,
  Play,
  Pause,
  ArrowRight,
  BookOpen,
  Compass,
  Leaf,
} from 'lucide-react';
import { BOOKS_CATALOG, type BookPageData } from '@/content/booksCatalog';
import type { AlignedWord } from '@/components/consultation/elPesoAudioWords';

export type ExitChoice = 'discover-book' | 'all-works' | 'dominant-work' | 'stay-in-consultation';

export interface BookPresentationScreenProps {
  onSelectExit?: (exit: ExitChoice, workCode: WorkCode) => void;
  onResetExperience?: () => void;
  onBackToWorksSelector?: () => void;
  selectedWork?: WorkCode;
  autoPlayAudio?: boolean;
}

export const BOOK_MOCKUP_PATH = '/images/mockupelpesoquenoseve.png';
export const BOOK_AUDIO_PATH = '/audio/audioelpeso.mp3';

/**
 * Plantilla oficial editorial y comercial para las seis obras de La Consulta.
 * «El peso que no se ve» (PP) constituye el benchmark aprobado.
 *
 * Estructura de 3 secciones:
 * - Zona 1: Presentación sobre crema cálido (#F4EBDD) con mockup volumétrico
 * - Zona 2: Fragmento sobre azul noche (#172B40) con lámina de lectura y audio sincronizado palabra por palabra
 * - Zona 3: Cierre, botones de acción y pilares editoriales
 *
 * En escritorio (1366x768 y 1440x900 al 100% zoom): las tres secciones quedan visibles en el área inicial.
 * En móvil: conserva intacta su composición vertical refinada y equilibrada.
 */
export function BookPresentationScreen({
  onSelectExit,
  onResetExperience,
  onBackToWorksSelector,
  selectedWork = 'PP',
}: BookPresentationScreenProps) {
  const book: BookPageData = BOOKS_CATALOG[selectedWork ?? 'PP'] || BOOKS_CATALOG.PP;
  const alignedWords = useMemo(() => book.alignedWords ?? [], [book.alignedWords]);
  const hasAudio = !!book.audioPath;

  // Estado y referencia para la reproducción del audio real
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Precarga y decodificación inmediata en memoria del mockup aprobado
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = book.mockupPath;
    if (img.decode) {
      img.decode().catch(() => {});
    }
  }, [book.mockupPath]);

  // Detener el audio de forma limpia
  const stopAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlayingAudio(false);
      setActiveWordIndex(null);
    }
    setAudioError(null);
  }, []);

  // Limpieza al desmontar o al cambiar de obra
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [book.workCode, stopAudio]);

  // Función de sincronización continua con el tiempo real de reproducción del audio
  const updateHighlight = useCallback(() => {
    const loop = () => {
      if (!audioRef.current) return;
      const t = audioRef.current.currentTime;

      // Buscar la palabra activa en el instante exacto t
      const currentWord = alignedWords.find((w) => t >= w.start && t <= w.end);
      if (currentWord) {
        setActiveWordIndex(currentWord.index);
      } else {
        // Durante micropausas naturales entre palabras, mantener resaltada la última palabra pronunciada
        const pastWords = alignedWords.filter((w) => w.start <= t);
        if (pastWords.length > 0) {
          setActiveWordIndex(pastWords[pastWords.length - 1].index);
        }
      }

      if (!audioRef.current.paused && !audioRef.current.ended) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    loop();
  }, [alignedWords]);

  // Manejador del control de audio: reproducir / pausar sin autoplay
  const toggleAudio = () => {
    if (!book.audioPath) return;

    if (!audioRef.current) {
      const audio = new Audio(book.audioPath);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        setActiveWordIndex(null);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      audio.onpause = () => {
        setIsPlayingAudio(false);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      audio.onplay = () => {
        setIsPlayingAudio(true);
        setAudioError(null);
        rafRef.current = requestAnimationFrame(updateHighlight);
      };

      audio.onerror = (e) => {
        console.warn('Aviso de carga de audio:', e);
        setIsPlayingAudio(false);
        setActiveWordIndex(null);
        const fileName = book.audioPath?.split('/').pop() || 'audio';
        setAudioError(`El archivo «${fileName}» no está subido en la carpeta /public/audio/. Sube el archivo para activar la lectura.`);
      };
    }

    if (isPlayingAudio) {
      // Al pausar: detener reproducción, mantener resaltada la palabra alcanzada
      audioRef.current.pause();
      setIsPlayingAudio(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    } else {
      // Al reanudar: continuar desde la posición guardada
      setAudioError(null);
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
          setAudioError(null);
          rafRef.current = requestAnimationFrame(updateHighlight);
        })
        .catch((err) => {
          console.warn('Reproducción de audio bloqueada o pausada:', err);
          setIsPlayingAudio(false);
          const fileName = book.audioPath?.split('/').pop() || 'audio';
          setAudioError(`No se pudo reproducir: el archivo «${fileName}» no se encuentra en el servidor.`);
        });
    }
  };

  const handleDiscoverBook = () => {
    stopAudio();
    if (onSelectExit) {
      onSelectExit('discover-book', book.workCode);
    } else if (onResetExperience) {
      onResetExperience();
    }
  };

  const handleExploreAllWorks = () => {
    stopAudio();
    if (onBackToWorksSelector) {
      onBackToWorksSelector();
    } else if (onSelectExit) {
      onSelectExit('all-works', book.workCode);
    } else if (onResetExperience) {
      onResetExperience();
    }
  };

  const handleReset = () => {
    stopAudio();
    if (onResetExperience) {
      onResetExperience();
    }
  };

  // Agrupación dinámica de palabras por párrafo para soportar los párrafos de la colección
  const paragraphWordGroups = useMemo(() => {
    const map = new Map<number, AlignedWord[]>();
    for (const w of alignedWords) {
      const p = w.paragraph || 1;
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(w);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, words]) => words);
  }, [alignedWords]);

  // Formato del título sin saltos de línea para resaltar menciones en cursiva
  const titleClean = book.title.replace(/\n/g, ' ');

  return (
    <div
      data-three-exits-root
      className="fixed inset-0 z-50 bg-[#F4EBDD] flex flex-col justify-start overflow-y-auto overflow-x-hidden select-text text-[#1D2C3D] animate-fade-in-final-page"
      style={{
        opacity: 0,
        animation: 'fadeInPageFinal 3s ease-in-out forwards',
        willChange: 'opacity',
      }}
    >
      {/* Precarga de alta prioridad del mockup oficial de la obra actual */}
      <link rel="preload" as="image" href={book.mockupPath} />

      {/* Cabecera editorial con opción de retorno al selector de obras y al inicio */}
      <header className="sticky top-0 inset-x-0 z-40 px-5 sm:px-8 py-3.5 sm:py-4 md:py-2 md:px-10 flex items-center justify-between pointer-events-none bg-[#F4EBDD]/90 backdrop-blur-md border-b border-[#D7C8B5]/60 transition-all shrink-0">
        <div className="pointer-events-auto flex items-center gap-2">
          {onBackToWorksSelector && (
            <button
              type="button"
              onClick={() => {
                stopAudio();
                onBackToWorksSelector();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 md:py-1 md:px-2.5 rounded-full bg-[#FAF5EB] hover:bg-[#FFFFFF] text-[#1D2C3D] text-xs font-serif border border-[#D7C8B5] transition-all cursor-pointer shadow-sm hover:shadow"
              aria-label="Volver al selector de las seis obras"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B85F43]" />
              <span>Selector de obras</span>
            </button>
          )}

          {onResetExperience && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 md:py-1 md:px-2.5 rounded-full bg-[#FAF5EB] hover:bg-[#FFFFFF] text-[#1D2C3D]/80 hover:text-[#1D2C3D] text-xs font-serif border border-[#D7C8B5] transition-all cursor-pointer shadow-sm hover:shadow"
              aria-label="Volver al inicio de La Consulta"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5F6870]" />
              <span>Inicio</span>
            </button>
          )}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="w-full flex flex-col items-center flex-1">
        
        {/* ============================================================== */}
        {/* ZONA 1 — PRESENTACIÓN DEL LIBRO (FONDO CREMA CÁLIDO #F4EBDD)  */}
        {/* ============================================================== */}
        <section
          aria-label="Presentación de la obra"
          className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 md:px-10 lg:px-12 pt-5 sm:pt-8 md:pt-3.5 lg:pt-4 pb-8 sm:pb-12 md:pb-3.5 lg:pb-4 shrink-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Mockup volumétrico del libro */}
            <div className="md:col-span-6 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[350px] sm:max-w-[420px] md:max-w-[340px] lg:max-w-[380px] xl:max-w-[410px]">
                <img
                  src={book.mockupPath}
                  alt={book.mockupAlt}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto max-h-[400px] md:max-h-[210px] lg:max-h-[235px] object-contain rounded-xl shadow-[0_20px_45px_-12px_rgba(29,44,61,0.22),0_8px_18px_-4px_rgba(29,44,61,0.08)] select-none transition-transform duration-500 hover:scale-[1.01]"
                  draggable={false}
                />
              </div>
            </div>

            {/* Columna Derecha: Título canónico y presentación editorial */}
            <div className="md:col-span-6 flex flex-col justify-center text-left">
              
              {/* Identificador superior */}
              <p className="font-serif text-[10.5px] sm:text-[11.5px] md:text-[10px] lg:text-[11px] tracking-[0.22em] uppercase text-[#5F6870] font-medium mb-2 md:mb-1">
                {book.volumeLabel}
              </p>

              {/* Gran titular editorial de la obra en terracota */}
              <h1 className="font-serif text-[28px] sm:text-[34px] md:text-[26px] lg:text-[30px] xl:text-[33px] leading-[1.08] md:leading-[1.05] tracking-tight text-[#B85F43] font-normal uppercase">
                {book.title.split('\n').map((line, idx, arr) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              {/* Subtítulo de la obra */}
              <p className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[11.5px] lg:text-[12.5px] text-[#1D2C3D] font-normal mt-2 sm:mt-2.5 md:mt-1 mb-3 sm:mb-3.5 md:mb-1.5 leading-snug">
                {book.subtitle}
              </p>

              {/* Separador fino */}
              <div className="w-12 md:w-12 h-[1px] bg-[#D7C8B5] mb-3.5 sm:mb-4 md:mb-2" aria-hidden="true" />

              {/* Titular destacado en terracota */}
              <p className="font-serif text-[17px] sm:text-[19px] md:text-[14.5px] lg:text-[16px] leading-[1.3] md:leading-[1.25] text-[#B85F43] font-normal tracking-tight mb-3.5 sm:mb-4 md:mb-2">
                {book.leadPhrase}
              </p>

              {/* Bloque de párrafos de presentación */}
              <div className="space-y-2.5 sm:space-y-3 md:space-y-1 lg:space-y-1.5 font-serif text-[14px] sm:text-[15px] md:text-[11px] lg:text-[11.5px] xl:text-[12px] text-[#1D2C3D]/90 font-light leading-[1.6] md:leading-[1.42] tracking-normal">
                {book.presentationParagraphs.map((para, idx) => {
                  if (para.includes(titleClean)) {
                    const parts = para.split(titleClean);
                    return (
                      <p key={idx}>
                        {parts[0]}
                        <em className="italic font-normal text-[#1D2C3D]">{titleClean}</em>
                        {parts[1]}
                      </p>
                    );
                  }
                  return <p key={idx}>{para}</p>;
                })}
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* ZONA 2 — FRAGMENTO DE LECTURA (FONDO AZUL NOCHE #172B40)       */}
        {/* ============================================================== */}
        <section
          aria-label="Fragmento de lectura del libro"
          className="w-full bg-[#172B40] text-[#F4EBDD] py-9 sm:py-12 md:py-3.5 lg:py-4 px-5 sm:px-8 md:px-10 lg:px-12 shrink-0"
        >
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Encabezado e introducción editorial sobre azul noche */}
            <div className="md:col-span-5 flex flex-col justify-center text-left">
              <span className="font-serif text-[10px] sm:text-[11px] md:text-[9.5px] lg:text-[10.5px] tracking-[0.24em] uppercase text-[#F4EBDD]/75 font-medium mb-2 md:mb-1">
                {book.excerptKicker}
              </span>

              <h2 className="font-serif text-[24px] sm:text-[28px] md:text-[22px] lg:text-[25px] xl:text-[27px] text-[#F4EBDD] font-normal leading-[1.12] md:leading-[1.1] tracking-tight mb-2.5 md:mb-2">
                {book.excerptTitle.split('\n').map((line, idx, arr) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>

              <div className="w-10 md:w-10 h-[1px] bg-[#D7C8B5]/40 mb-2.5 md:mb-2" aria-hidden="true" />

              <p className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[11px] lg:text-[11.5px] text-[#F4EBDD]/85 font-light leading-[1.58] md:leading-[1.45] max-w-[420px] md:max-w-[340px]">
                {book.excerptIntro}
              </p>
            </div>

            {/* Columna Derecha: Tarjeta de papel editorial con audio y lectura sincronizada */}
            <div className="md:col-span-7 flex justify-center">
              <div className="w-full max-w-[620px] md:max-w-[610px] bg-[#FAF5EC] text-[#1D2C3D] rounded-xl sm:rounded-2xl md:rounded-xl p-5 sm:p-6 md:p-3.5 lg:p-4 shadow-[0_16px_36px_rgba(10,20,30,0.35)] md:shadow-[0_16px_36px_rgba(10,20,30,0.28)] border border-[#E7DAC8]/70">
                
                {/* Control de Audio interactivo (o estado en preparación si no hay archivo de voz) */}
                <div className="mb-4 pb-3.5 md:mb-2.5 md:pb-2 border-b border-[#D7C8B5]/60 flex flex-col items-start gap-2">
                  {hasAudio ? (
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="inline-flex items-center gap-3 md:gap-2.5 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F43] rounded-full pr-3 py-1"
                      aria-label={
                        isPlayingAudio
                          ? 'Pausar la lectura de Elena'
                          : 'Escuchar a Elena leer este pasaje'
                      }
                    >
                      <span className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-full bg-[#B85F43] group-hover:bg-[#A04D33] text-[#FAF5EB] flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-105 shrink-0">
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 md:w-3.5 md:h-3.5 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 md:w-3.5 md:h-3.5 ml-0.5 fill-current" />
                        )}
                      </span>
                      <span className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[12px] lg:text-[12.5px] text-[#B85F43] group-hover:text-[#A04D33] font-medium leading-snug transition-colors">
                        {isPlayingAudio ? 'Pausar lectura' : 'Escuchar a Elena leer este pasaje'}
                      </span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-3 md:gap-2.5 text-left py-1 text-[#8A8177]">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-full bg-[#E5DDD0] text-[#8A8177] flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 md:w-3.5 md:h-3.5 ml-0.5 fill-current opacity-50" />
                      </span>
                      <span className="font-serif text-[13px] sm:text-[14px] md:text-[11.5px] lg:text-[12px] italic text-[#7A7168]">
                        Lectura en voz de Elena en preparación para este volumen
                      </span>
                    </div>
                  )}

                  {audioError && (
                    <div className="text-[12px] md:text-[11px] font-serif text-[#A04D33] bg-[#B85F43]/10 border border-[#B85F43]/20 rounded-md px-3 py-1.5 inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B85F43] shrink-0" />
                      <span>{audioError}</span>
                    </div>
                  )}
                </div>

                {/* Texto literal del fragmento con resaltado palabra por palabra */}
                {alignedWords.length > 0 ? (
                  <div className="space-y-3.5 md:space-y-2 font-serif text-[13.5px] sm:text-[14.5px] md:text-[11px] lg:text-[11.5px] xl:text-[12px] leading-[1.65] md:leading-[1.46] font-light text-[#1D2C3D]">
                    {paragraphWordGroups.map((group, groupIdx) => (
                      <React.Fragment key={groupIdx}>
                        {groupIdx > 0 && (
                          <div className="w-10 h-[1px] bg-[#D7C8B5]/70 my-2.5 md:my-1.5" aria-hidden="true" />
                        )}
                        <p>
                          {group.map((w) => {
                            const isHighlighted = activeWordIndex === w.index;
                            return (
                              <React.Fragment key={w.index}>
                                <span
                                  data-word-idx={w.index}
                                  className={
                                    isHighlighted
                                      ? 'bg-[#B85F43] text-[#FAF5EC] rounded-xs px-[1.5px] transition-colors duration-75'
                                      : 'text-[#1D2C3D] transition-colors duration-75'
                                  }
                                >
                                  {w.word}
                                </span>{' '}
                              </React.Fragment>
                            );
                          })}
                        </p>
                      </React.Fragment>
                    ))}
                  </div>
                ) : book.excerptParagraphs && book.excerptParagraphs.length > 0 ? (
                  <div className="space-y-3.5 md:space-y-2 font-serif text-[13.5px] sm:text-[14.5px] md:text-[11px] lg:text-[11.5px] xl:text-[12px] leading-[1.65] md:leading-[1.46] font-light text-[#1D2C3D]">
                    {book.excerptParagraphs.map((para, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <div className="w-10 h-[1px] bg-[#D7C8B5]/70 my-2.5 md:my-1.5" aria-hidden="true" />
                        )}
                        <p>{para}</p>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3.5 md:space-y-2 font-serif text-[13.5px] sm:text-[14.5px] md:text-[11px] lg:text-[11.5px] xl:text-[12px] leading-[1.65] md:leading-[1.46] font-light text-[#6F6860]">
                    <p className="italic">
                      El pasaje de lectura y la grabación de Elena para este volumen se incorporarán cuando el audio esté disponible.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* ZONA 3 — CIERRE Y NAVEGACIÓN (FONDO CREMA CÁLIDO #F4EBDD)      */}
        {/* ============================================================== */}
        <section
          aria-label="Cierre y llamadas a la acción"
          className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 md:px-10 lg:px-12 py-9 sm:py-12 md:py-3.5 lg:py-4 shrink-0"
        >
          {/* Fila superior: Pregunta de cierre y botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 md:gap-8 lg:gap-12 items-center pb-7 sm:pb-9 md:pb-3 border-b border-[#D7C8B5]/60">
            
            {/* Columna Izquierda: ¿Te reconoces en estas líneas? */}
            <div className="md:col-span-6 text-left">
              <h3 className="font-serif text-[23px] sm:text-[27px] md:text-[20px] lg:text-[23px] xl:text-[25px] leading-[1.15] md:leading-[1.12] text-[#1D2C3D] font-normal tracking-tight mb-2 md:mb-1">
                {book.closingQuestion.split('\n').map((line, idx, arr) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h3>
              <p className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[11px] lg:text-[11.5px] text-[#5F6870] font-light leading-[1.5] md:leading-[1.4] max-w-[460px] md:max-w-[390px]">
                {book.closingText}
              </p>
            </div>

            {/* Columna Derecha: Botón principal y enlace secundario */}
            <div className="md:col-span-6 flex flex-col items-start md:items-end gap-3 md:gap-1.5">
              <button
                type="button"
                onClick={handleDiscoverBook}
                className="inline-flex items-center justify-center gap-2.5 md:gap-2 px-6 sm:px-7 md:px-6 lg:px-8 py-3 sm:py-3.5 md:py-2 lg:py-2.5 rounded-full bg-[#B85F43] hover:bg-[#A04D33] text-[#F4EBDD] hover:text-[#FFFFFF] text-[14.5px] sm:text-[15.5px] md:text-[12.5px] lg:text-[13.5px] font-serif font-medium tracking-wide transition-all duration-300 cursor-pointer shadow-[0_8px_22px_rgba(184,95,67,0.32)] hover:shadow-[0_12px_28px_rgba(184,95,67,0.42)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F43]"
              >
                <span>{book.ctaLabel}</span>
                <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleExploreAllWorks}
                className="text-[13px] sm:text-[14px] md:text-[11px] lg:text-[11.5px] font-serif text-[#5F6870] hover:text-[#1D2C3D] underline decoration-[#D7C8B5] hover:decoration-[#B85F43] underline-offset-4 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5F6870] self-start md:self-end md:mr-6"
              >
                {book.secondaryLinkLabel}
              </button>
            </div>

          </div>

          {/* Fila inferior: Pilares editoriales con iconos discretos en terracota */}
          <div className="pt-6 sm:pt-7 md:pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 md:gap-4 text-left">
            {book.pillars.map((pillar, idx) => (
              <div key={idx} className="flex items-center gap-3.5 md:gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-full border border-[#D7C8B5] bg-[#FAF5EB] flex items-center justify-center shrink-0 text-[#B85F43]">
                  {pillar.icon === 'book' && <BookOpen className="w-4 h-4 md:w-3.5 md:h-3.5 stroke-[1.6]" />}
                  {pillar.icon === 'compass' && <Compass className="w-4 h-4 md:w-3.5 md:h-3.5 stroke-[1.6]" />}
                  {pillar.icon === 'leaf' && <Leaf className="w-4 h-4 md:w-3.5 md:h-3.5 stroke-[1.6]" />}
                </div>
                <p className="font-serif text-[13px] sm:text-[13.5px] md:text-[10.5px] lg:text-[11px] text-[#1D2C3D] font-light leading-snug">
                  {pillar.text.split('\n').map((line, pIdx, pArr) => (
                    <React.Fragment key={pIdx}>
                      {line}
                      {pIdx < pArr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// Exportación como ThreeExitsScreen para preservar compatibilidad con el flujo de La Consulta
export { BookPresentationScreen as ThreeExitsScreen };
