'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import {
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Volume2,
} from 'lucide-react';
import type { WorkCode } from '@/engine/selectionEngine';
import { BOOKS_CATALOG, type BookPageData } from '@/content/booksCatalog';

export interface WorksSelectorScreenProps {
  onSelectWork: (workCode: WorkCode) => void;
  onBackToIntro: () => void;
  selectedWork?: WorkCode;
}

interface WorkCardDef {
  code: WorkCode;
  orderLabel: string;
  status: 'approved' | 'in-review' | 'in-progress';
  statusLabel: string;
  hasAudio: boolean;
}

const WORKS_ORDER: WorkCardDef[] = [
  {
    code: 'DD',
    orderLabel: 'Volumen I',
    status: 'in-review',
    statusLabel: 'En revisión editorial',
    hasAudio: true,
  },
  {
    code: 'PP',
    orderLabel: 'Volumen II',
    status: 'approved',
    statusLabel: 'Plantilla oficial aprobada',
    hasAudio: true,
  },
  {
    code: 'EM',
    orderLabel: 'Volumen III',
    status: 'in-progress',
    statusLabel: 'En preparación',
    hasAudio: false,
  },
  {
    code: 'CM',
    orderLabel: 'Volumen IV',
    status: 'in-progress',
    statusLabel: 'En preparación',
    hasAudio: false,
  },
  {
    code: 'ES',
    orderLabel: 'Volumen V',
    status: 'in-progress',
    statusLabel: 'En preparación',
    hasAudio: false,
  },
  {
    code: 'UC',
    orderLabel: 'Volumen VI',
    status: 'in-progress',
    statusLabel: 'En preparación',
    hasAudio: false,
  },
];

export function WorksSelectorScreen({
  onSelectWork,
  onBackToIntro,
  selectedWork,
}: WorksSelectorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#F4EBDD] flex flex-col justify-start overflow-y-auto overflow-x-hidden text-[#1D2C3D]">
      {/* Cabecera superior de navegación de ida y vuelta */}
      <header className="sticky top-0 inset-x-0 z-40 px-5 sm:px-8 py-3.5 sm:py-4 md:py-3 md:px-10 flex items-center justify-between bg-[#F4EBDD]/90 backdrop-blur-md border-b border-[#D7C8B5]/70 shrink-0">
        <button
          type="button"
          onClick={onBackToIntro}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EB] hover:bg-[#FFFFFF] text-[#1D2C3D] text-xs font-serif border border-[#D7C8B5] transition-all cursor-pointer shadow-sm hover:shadow"
          aria-label="Volver a la pantalla inicial del preview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#5F6870]" />
          <span>Volver al inicio del preview</span>
        </button>

        <div className="text-right">
          <span className="font-serif text-[11px] uppercase tracking-wider text-[#7A7168]">
            Entorno de revisión editorial
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-10 flex flex-col items-center flex-1">
        
        {/* Título y descripción del selector */}
        <div className="text-center max-w-[720px] mb-8 sm:mb-10">
          <p className="font-serif text-xs tracking-[0.24em] uppercase text-[#7A7168] font-medium mb-2">
            La Consulta · Colección de seis obras
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#B85F43] font-normal tracking-tight mb-3">
            Páginas de las seis obras
          </h1>
          <p className="font-serif text-sm sm:text-base text-[#1D2C3D]/80 font-light leading-relaxed">
            Accede y revisa visualmente la página de cada volumen. Selecciona cualquiera de las obras para inspeccionar su composición editorial, mockup, textos y recursos.
          </p>
        </div>

        {/* Cuadrícula de las 6 obras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full">
          {WORKS_ORDER.map((item) => {
            const book: BookPageData = BOOKS_CATALOG[item.code] || BOOKS_CATALOG.PP;
            const isSelected = selectedWork === item.code;

            return (
              <div
                key={item.code}
                onClick={() => onSelectWork(item.code)}
                className={`group relative bg-[#FAF5EC] rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  item.status === 'approved'
                    ? 'border-[#B85F43]/40 hover:border-[#B85F43]'
                    : item.status === 'in-review'
                    ? 'border-[#3D2C1E]/30 hover:border-[#3D2C1E]'
                    : 'border-[#D7C8B5]/70 hover:border-[#A18F7B]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectWork(item.code);
                  }
                }}
                aria-label={`Ver página editorial de ${book.title.replace(/\n/g, ' ')}`}
              >
                <div>
                  {/* Fila superior: Volumen y Badge de Estado */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A7168]">
                      {item.orderLabel}
                    </span>

                    {item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-[#B85F43]/15 text-[#B85F43] border border-[#B85F43]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aprobada</span>
                      </span>
                    ) : item.status === 'in-review' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-[#DCD1C2] text-[#3D2C1E] border border-[#B0A290]">
                        <BookOpen className="w-3 h-3" />
                        <span>En revisión</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-[#E8DFC8]/60 text-[#7A7168] border border-[#D7C8B5]">
                        <Clock className="w-3 h-3" />
                        <span>En preparación</span>
                      </span>
                    )}
                  </div>

                  {/* Imagen del Mockup */}
                  <div className="w-full flex justify-center items-center py-4 my-1">
                    <img
                      src={book.mockupPath}
                      alt={book.mockupAlt}
                      loading="lazy"
                      className="max-h-[170px] sm:max-h-[190px] w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Título de la obra */}
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1D2C3D] font-normal leading-tight mb-2 group-hover:text-[#B85F43] transition-colors">
                    {book.title.replace(/\n/g, ' ')}
                  </h2>

                  {/* Subtítulo */}
                  <p className="font-serif text-xs text-[#5F6870] font-light leading-relaxed line-clamp-2 mb-4">
                    {book.subtitle}
                  </p>
                </div>

                {/* Pie de tarjeta: características y botón de acceso */}
                <div className="pt-3 border-t border-[#D7C8B5]/60 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {item.hasAudio ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-serif text-[#B85F43]" title="Audio de Elena sincronizado disponible">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Voz sincronizada</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-serif text-[#8A8177]">
                        Audio en preparación
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-serif font-medium text-[#B85F43] group-hover:translate-x-0.5 transition-transform">
                    <span>Abrir página</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#B85F43] ring-4 ring-[#F4EBDD]" />
                )}
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
