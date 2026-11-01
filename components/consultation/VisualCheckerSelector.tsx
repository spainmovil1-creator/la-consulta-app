'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';
import type { WorkCode } from '@/engine/selectionEngine';
import { WORKS_METADATA } from '@/engine/selectionEngine';
import { WORKS_CARDS_MAP } from '@/content/cards';

interface VisualCheckerSelectorProps {
  onSelectCard: (workCode: WorkCode, cardNumber: number) => void;
  onExit: () => void;
}

interface WorkCheckerSection {
  code: WorkCode;
  title: string;
  globalStart: number;
  globalEnd: number;
}

const CHECKER_SECTIONS: WorkCheckerSection[] = [
  { code: 'PP', title: 'El peso que no se ve', globalStart: 1, globalEnd: 5 },
  { code: 'ES', title: 'El eco del silencio', globalStart: 6, globalEnd: 10 },
  { code: 'EM', title: 'El espejo que miente', globalStart: 11, globalEnd: 15 },
  { code: 'CM', title: 'Cuando el mañana te secuestra', globalStart: 16, globalEnd: 20 },
  { code: 'DD', title: 'El día que dejé de ser', globalStart: 21, globalEnd: 25 },
  { code: 'UC', title: 'La única certeza', globalStart: 26, globalEnd: 30 },
];

export function VisualCheckerSelector({
  onSelectCard,
  onExit,
}: VisualCheckerSelectorProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | WorkCode>('ALL');

  const filteredSections = activeFilter === 'ALL'
    ? CHECKER_SECTIONS
    : CHECKER_SECTIONS.filter((s) => s.code === activeFilter);

  return (
    <div className="fixed inset-0 z-50 bg-[#16110D] text-[#EDE7DF] overflow-y-auto p-4 sm:p-6 md:p-10 select-none">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        
        {/* BARRA SUPERIOR DE NAVEGACIÓN Y CABECERA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C241E] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241C16] border border-[#423326] text-xs font-serif text-[#D4A373]">
              <Eye className="w-3.5 h-3.5" />
              <span>Modo Comprobación Visual Exclusivo · Entorno de Preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] tracking-tight">
              Selector de Comprobación de Cartas (30 Posiciones)
            </h1>
            <p className="text-xs sm:text-sm text-[#A89A8A] font-light max-w-2xl leading-relaxed">
              Accede directamente a cualquiera de las 30 cartas sin responder el cuestionario ni alterar la rotación de producción. Las pruebas se ejecutan de forma totalmente aislada.
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

        {/* RESUMEN DE ESTADO EDITORIAL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[#1F1914] border border-[#382E25] flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#2C2117] text-[#D4A373]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#8C8176] uppercase tracking-wider">Cartas Definitivas</p>
              <p className="text-sm font-serif text-[#FFFFFF]">30 aprobadas (Catálogo completo)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1F1914] border border-[#382E25] flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#241C16] text-[#A89A8A]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#8C8176] uppercase tracking-wider">Distribución Canónica</p>
              <p className="text-sm font-serif text-[#E0D5C7]">6 obras · 5 cartas c/u</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1F1914] border border-[#382E25] flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#1B241C] text-[#81C784]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#8C8176] uppercase tracking-wider">Aislamiento</p>
              <p className="text-sm font-serif text-[#C4DDC7]">Contadores reales intactos</p>
            </div>
          </div>
        </div>

        {/* FILTROS POR OBRA */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#2C241E] pb-3">
          <span className="text-xs text-[#8C8176] mr-2 font-serif">Filtrar por obra:</span>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-serif transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-[#3D2C1E] text-[#FFFFFF] font-medium border border-[#6B4E35]'
                : 'bg-[#1C1612] text-[#A89A8A] hover:bg-[#261E18] border border-transparent'
            }`}
          >
            Todas (30)
          </button>
          {CHECKER_SECTIONS.map((sec) => (
            <button
              key={sec.code}
              type="button"
              onClick={() => setActiveFilter(sec.code)}
              className={`px-3 py-1 rounded-md text-xs font-serif transition-colors cursor-pointer ${
                activeFilter === sec.code
                  ? 'bg-[#3D2C1E] text-[#FFFFFF] font-medium border border-[#6B4E35]'
                  : 'bg-[#1C1612] text-[#A89A8A] hover:bg-[#261E18] border border-transparent'
              }`}
            >
              {sec.code} · {sec.title.split(' ')[0]} {sec.title.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* LISTADO DE LAS 6 SECCIONES CANÓNICAS */}
        <div className="space-y-6">
          {filteredSections.map((sec) => {
            const meta = WORKS_METADATA[sec.code];
            return (
              <div
                key={sec.code}
                className="p-5 rounded-xl bg-[#1C1713]/90 border border-[#2E241C] shadow-lg space-y-4"
              >
                {/* Cabecera de la obra */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#2C221A] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-[#2D2117] text-[#D4A373] font-serif text-xs font-semibold border border-[#473424]">
                      {sec.code}
                    </span>
                    <h2 className="text-lg font-serif text-[#FFFFFF] font-normal">
                      {meta.title}
                    </h2>
                  </div>
                  <span className="text-xs text-[#8C8176] font-serif">
                    Cartas canónicas {sec.globalStart} a {sec.globalEnd} (5 posiciones)
                  </span>
                </div>

                {/* 5 botones de cartas por obra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {[1, 2, 3, 4, 5].map((localNum) => {
                    const globalNum = sec.globalStart + localNum - 1;
                    const cardDef = WORKS_CARDS_MAP[sec.code]?.[localNum];
                    const isDefinitive = cardDef?.isDefinitive === true;

                    return (
                      <button
                        key={localNum}
                        type="button"
                        onClick={() => onSelectCard(sec.code, localNum)}
                        className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-28 group ${
                          isDefinitive
                            ? 'bg-[#291F16]/80 hover:bg-[#382A1D] border-[#664C33] shadow-md hover:border-[#8C6947]'
                            : 'bg-[#181310] hover:bg-[#241D17] border-[#2E241C] hover:border-[#47382B]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-mono text-[#8C8176] group-hover:text-[#B3A698]">
                            #{globalNum}
                          </span>
                          {isDefinitive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#3D2C1A] text-[#E5BA8A] font-serif font-medium border border-[#6B4E2B]">
                              <Sparkles className="w-2.5 h-2.5" />
                              Definitiva
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#1E1915] text-[#8C8176] font-serif">
                              <Clock className="w-2.5 h-2.5" />
                              Pendiente
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-serif font-medium text-[#EDE7DF] group-hover:text-[#FFFFFF]">
                            Carta {localNum} de 5
                          </p>
                          <p className="text-[11px] font-serif text-[#A89A8A] line-clamp-1 mt-0.5">
                            {isDefinitive ? cardDef.title : 'Estado provisional'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
