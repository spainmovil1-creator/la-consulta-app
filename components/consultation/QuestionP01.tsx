'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { QUESTIONS_CONFIG, HitAreaRect, QuestionDeviceConfig } from '@/lib/questionsConfig';

export type P01OptionKey = 'A' | 'B' | 'C' | 'D';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface AnswerRegistration {
  questionId: string;
  key: P01OptionKey;
  responseNumber: number;
}

interface QuestionP01Props {
  deviceMode: 'auto' | 'desktop' | 'tablet' | 'mobile';
  onBackToVestibulo: () => void;
  onResetAll: () => void;
  onAnswerSelected: (answer: AnswerRegistration) => void;
}

export function QuestionP01({
  deviceMode,
  onBackToVestibulo,
  onResetAll,
  onAnswerSelected,
}: QuestionP01Props) {
  const [selectedKey, setSelectedKey] = useState<P01OptionKey | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoDetected, setAutoDetected] = useState<DeviceType>('desktop');

  // Detección en vivo de orientación y tamaño para modo 'auto'
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
  const config = QUESTIONS_CONFIG.P01;
  const currentDeviceConfig: QuestionDeviceConfig = config[activeDevice] || config.desktop;
  const hitAreas = currentDeviceConfig.hitAreas;

  // Interacción táctil y accesible:
  // 1. Registro de la respuesta
  // 2. Feedback visual sutil (200ms)
  // 3. Transición automática inmediata hacia el siguiente estado
  // 4. CERO pantallas intermedias de validación, CERO botones «Continuar»
  const handleSelectOption = (key: P01OptionKey) => {
    if (isTransitioning) return;
    const option = hitAreas[key];
    if (!option) {
      console.error(`Error explícito de configuración: No existe hit area para ${key} en ${activeDevice}`);
      return;
    }

    setSelectedKey(key);
    setIsTransitioning(true);

    // Feedback visual sutil (200ms) → transición inmediata
    setTimeout(() => {
      onAnswerSelected({
        questionId: 'P01',
        key,
        responseNumber: option.responseNumber,
      });
    }, 220);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center overflow-hidden select-none">
      {/* Atmósfera ambiental difuminada detrás del contenedor */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <img
          src={currentDeviceConfig.src}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover blur-3xl scale-125 opacity-35 brightness-75"
        />
      </div>

      {/* BARRA SUPERIOR: PROGRESO DISCRETO 1 / 15 + BOTONES DE NAVEGACIÓN */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToVestibulo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/85 hover:bg-[#181614] text-[#E0D5C7]/90 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
            title="Volver al Vestíbulo"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#C4B5A5]" />
            <span>Vestíbulo</span>
          </button>

          {/* Indicador discreto de progreso: 1 / 15 (sin barras invasivas) */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#181614]/70 backdrop-blur-md border border-[#3E3833]/60 text-xs font-mono tracking-widest text-[#D4C8BC]">
            1 / 15
          </div>
        </div>

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

      {/* CONTENEDOR PRINCIPAL ESPECÍFICO POR DISPOSITIVO */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
        <div
          className={`relative flex items-center justify-center w-full max-h-full transition-opacity duration-300 ${
            currentDeviceConfig.aspectRatioClass
          } ${currentDeviceConfig.maxWidthClass} ${
            isTransitioning ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Composición editorial completa nativa del dispositivo */}
          <img
            src={currentDeviceConfig.src}
            alt={`Pregunta 1 de La Consulta (${currentDeviceConfig.id})`}
            className="w-full h-full object-contain select-none pointer-events-none drop-shadow-2xl"
            draggable={false}
          />

          {/* HIT AREAS EXACTAS DEL FORMATO ACTIVO */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {(Object.keys(hitAreas) as P01OptionKey[]).map((key) => {
              const area: HitAreaRect = hitAreas[key];
              const isSelected = selectedKey === key;

              return (
                <button
                  key={`${activeDevice}-${key}`}
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => handleSelectOption(key)}
                  aria-label={`Seleccionar ${area.label}`}
                  style={{
                    position: 'absolute',
                    top: area.top,
                    left: area.left,
                    width: area.width,
                    height: area.height,
                  }}
                  className={`rounded-2xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                    isSelected
                      ? 'bg-[#E0D5C7]/25 ring-2 ring-[#E0D5C7]/80 scale-[0.985] shadow-lg shadow-[#D4AF37]/25'
                      : 'hover:bg-white/[0.06] hover:ring-1 hover:ring-[#E0D5C7]/40 active:scale-[0.99]'
                  }`}
                >
                  <span className="sr-only">{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
