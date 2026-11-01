'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { QUESTIONS_CONFIG, HitAreaRect, QuestionDeviceConfig } from '@/lib/questionsConfig';

export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface AnswerRegistration {
  questionId: string;
  questionNumber: number;
  key: OptionKey;
  responseNumber: number;
}

interface QuestionScreenProps {
  questionId: 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06' | 'P07' | 'P08' | 'P09' | 'P10' | 'P11' | 'P12' | 'P13' | 'P14' | 'P15';
  deviceMode: 'auto' | 'desktop' | 'tablet' | 'mobile';
  onBack: () => void;
  backLabel?: string;
  onResetAll: () => void;
  onAnswerSelected: (answer: AnswerRegistration) => void;
  hideDefaultNav?: boolean;
}

export function QuestionScreen({
  questionId,
  deviceMode,
  onBack,
  backLabel = 'Volver',
  onResetAll,
  onAnswerSelected,
  hideDefaultNav = false,
}: QuestionScreenProps) {
  const [selectedKey, setSelectedKey] = useState<OptionKey | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoDetected, setAutoDetected] = useState<DeviceType>('desktop');

  // Reset de estado defensivo si questionId cambia en la misma instancia (patrón recomendado de React)
  const [prevQuestionId, setPrevQuestionId] = useState(questionId);
  if (prevQuestionId !== questionId) {
    setPrevQuestionId(questionId);
    setIsTransitioning(false);
    setSelectedKey(null);
  }

  // Detección responsive en vivo para modo 'auto'
  useEffect(() => {
    const evaluateDevice = () => {
      if (typeof window === 'undefined') return;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isWide = window.innerWidth >= 1024;
      const isTablet = window.innerWidth >= 600 && window.innerWidth < 1024 && !isLandscape;

      if (isLandscape || isWide) {
        setAutoDetected('desktop');
      } else if (isTablet) {
        setAutoDetected('tablet');
      } else {
        setAutoDetected('mobile');
      }
    };

    evaluateDevice();
    window.addEventListener('resize', evaluateDevice);
    return () => window.removeEventListener('resize', evaluateDevice);
  }, []);

  const activeDevice: DeviceType = deviceMode === 'auto' ? autoDetected : deviceMode;
  const config = QUESTIONS_CONFIG[questionId];
  if (!config) {
    throw new Error(`Configuración no encontrada para la pregunta ${questionId}`);
  }

  const currentDeviceConfig: QuestionDeviceConfig = config[activeDevice] || config.desktop;
  const hitAreas = currentDeviceConfig.hitAreas;

  // Interacción táctil y accesible:
  // 1. Registro de la respuesta (A→1, B→2, C→3, D→4)
  // 2. Feedback visual sutil (200ms)
  // 3. Transición automática inmediata hacia el siguiente estado
  // 4. CERO botones «Continuar»
  const handleSelectOption = (key: OptionKey) => {
    if (isTransitioning) return;
    const option = hitAreas[key];
    if (!option) {
      console.error(`Error explícito de configuración: No existe hit area para ${key} en ${questionId} (${activeDevice})`);
      return;
    }

    setSelectedKey(key);
    setIsTransitioning(true);

    // Feedback visual sutil (200ms) → transición inmediata
    setTimeout(() => {
      onAnswerSelected({
        questionId,
        questionNumber: config.number,
        key,
        responseNumber: option.responseNumber,
      });
    }, 220);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center overflow-hidden select-none">
      {/* Atmósfera ambiental difuminada detrás del contenedor */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
        <img
          src={currentDeviceConfig.src}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover blur-3xl scale-125 opacity-35 brightness-75"
        />
      </div>

      {/* BARRA SUPERIOR: NAVEGACIÓN Y ACCESIBILIDAD (SIN DUPLICAR EL INDICADOR QUE YA ESTÁ EN EL PNG) */}
      {!hideDefaultNav && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/85 hover:bg-[#181614] text-[#E0D5C7]/90 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
          title={backLabel}
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#C4B5A5]" />
          <span>{backLabel}</span>
        </button>

        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181614]/85 hover:bg-[#181614] text-[#E0D5C7]/80 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
          title="Reiniciar todo el flujo desde la Intro"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform text-[#C4B5A5]" />
          <span>Reiniciar</span>
        </button>
      </div>
      )}

      {/* CONTENEDOR PRINCIPAL ESPECÍFICO POR DISPOSITIVO: IDÉNTICO A P01..P07 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
        <div
          className={`relative flex items-center justify-center h-full w-auto max-w-full max-h-full transition-opacity duration-300 ${
            currentDeviceConfig.aspectRatioClass
          } ${currentDeviceConfig.maxWidthClass} ${
            isTransitioning ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Composición editorial completa nativa del dispositivo */}
          <img
            src={currentDeviceConfig.src}
            alt={`Pregunta ${config.number} de La Consulta (${currentDeviceConfig.id})`}
            className="w-full h-full object-contain select-none pointer-events-none drop-shadow-2xl"
            draggable={false}
          />

          {/* HIT AREAS EXACTAS DEL FORMATO ACTIVO (BOTONES ACCESIBLES E INVISIBLES SOBRE CADA TARJETA) */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {(Object.keys(hitAreas) as OptionKey[]).map((key) => {
              const area: HitAreaRect = hitAreas[key];
              const isSelected = selectedKey === key;

              return (
                <button
                  key={`${questionId}-${activeDevice}-${key}`}
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => handleSelectOption(key)}
                  aria-label={`${area.label} (${key})`}
                  style={{
                    top: area.top,
                    left: area.left,
                    width: area.width,
                    height: area.height,
                  }}
                  className={`absolute rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DF] ${
                    isSelected
                      ? 'bg-white/20 ring-2 ring-white/80 scale-[0.99]'
                      : 'hover:bg-white/[0.07] hover:ring-1 hover:ring-[#EDE7DF]/35 active:scale-[0.98]'
                  }`}
                >
                  <span className="sr-only">
                    {area.label} — Opción {key}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
