'use client';

import React from 'react';
import { CANONICAL_WORKS } from '@/content/works';
import { useSession, clearSession } from '@/state/session';
import { CheckCircle2, Layers, BookOpen, Compass, RefreshCw, Sparkles } from 'lucide-react';

export function BaseAppShell() {
  const session = useSession();

  const handleResetSession = () => {
    clearSession();
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      {/* Cabecera institucional sobria y atmosférica */}
      <header className="border-b border-[#E8E1D9] pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9C8F80] font-medium">
              Proyecto Editorial
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-[#1F1D1A] tracking-tight mt-1">
              La Consulta
            </h1>
            <p className="text-sm text-[#736B63] mt-1 font-light">
              Elena Vargas · Canon 2.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFE9E2] text-[#5C544D] border border-[#DDD5CC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
              Fase 1 · Proyecto Base Operativo
            </span>
          </div>
        </div>
      </header>

      {/* Tarjeta de estado de arquitectura del sistema */}
      <section className="bg-[#FFFFFF] border border-[#E8E1D9] rounded-xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 text-[#5C544D] mb-4">
          <Layers className="w-5 h-5 text-[#8C7A6B]" />
          <h2 className="text-base font-medium tracking-tight uppercase text-xs text-[#5C544D]">
            Arquitectura Modular Desacoplada
          </h2>
        </div>

        <p className="text-sm text-[#665E56] leading-relaxed mb-6 font-light">
          La base técnica se encuentra completamente configurada y operativa en el navegador. Las capas
          de motor, contenido editorial, persistencia de estado y presentación visual están estrictamente
          separadas para permitir la incorporación limpia de assets y secuencias en las siguientes fases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#8C7A6B]">/engine</span>
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
            </div>
            <h3 className="text-sm font-medium text-[#2C2926]">Recognition Engine</h3>
            <p className="text-xs text-[#7A7168] mt-1">
              Desacoplado de React y UI. Tipos preparados para C1–C5 y estados normalizados.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#8C7A6B]">/content</span>
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
            </div>
            <h3 className="text-sm font-medium text-[#2C2926]">Contenido Editorial</h3>
            <p className="text-xs text-[#7A7168] mt-1">
              Modelos de datos independientes de componentes. 6 obras canónicas tipadas.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#8C7A6B]">/state</span>
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
            </div>
            <h3 className="text-sm font-medium text-[#2C2926]">Sesión y Navegación</h3>
            <p className="text-xs text-[#7A7168] mt-1">
              Persistencia segura (localStorage) y estado de flujo de La Consulta.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#8C7A6B]">/components</span>
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
            </div>
            <h3 className="text-sm font-medium text-[#2C2926]">Contenedor Responsive</h3>
            <p className="text-xs text-[#7A7168] mt-1">
              Atmósfera cálida de la casa, soporte responsive móvil/tablet/desktop.
            </p>
          </div>
        </div>
      </section>

      {/* Recorrido Canónico Planificado */}
      <section className="bg-[#FAF7F2] border border-[#E8E1D9] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-2.5 text-[#5C544D] mb-4">
          <Compass className="w-5 h-5 text-[#8C7A6B]" />
          <h2 className="text-xs font-medium tracking-tight uppercase text-[#5C544D]">
            Recorrido Principal Preparado (Canon 2.0)
          </h2>
        </div>

        <p className="text-xs text-[#7A7168] mb-5">
          Secuencia modular que se activará en los ciclos de construcción correspondientes:
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#4A433D]">
          {['Intro', 'Vídeo / Entrada', 'Vestíbulo', 'La Consulta (P01–P15)', 'Recognition Engine', 'Resultado Editorial', 'Carta', 'Habitaciones / Obras'].map(
            (step, idx, arr) => (
              <React.Fragment key={step}>
                <span className="px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E0D8CE] shadow-2xs">
                  {step}
                </span>
                {idx < arr.length - 1 && (
                  <span className="text-[#B3A89B]">→</span>
                )}
              </React.Fragment>
            )
          )}
        </div>
      </section>

      {/* Las Seis Obras de la Casa (Canon 2.0) */}
      <section className="border border-[#E8E1D9] bg-[#FFFFFF] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-2.5 text-[#5C544D] mb-4">
          <BookOpen className="w-5 h-5 text-[#8C7A6B]" />
          <h2 className="text-xs font-medium tracking-tight uppercase text-[#5C544D]">
            Las Seis Obras Canónicas de la Casa
          </h2>
        </div>
        <p className="text-xs text-[#7A7168] mb-6">
          Una única casa editorial. Seis obras con identidad propia que comparten una arquitectura común:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANONICAL_WORKS.map((work) => (
            <div
              key={work.slug}
              className="p-4 rounded-lg border border-[#EDE6DC] bg-[#FAF8F5] transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-[#998E82] mb-1 font-mono">
                <span>0{work.order}</span>
                <span>{work.slug}</span>
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#2C2926]">
                {work.title}
              </h3>
              <p className="text-xs text-[#6E665E] mt-1 font-light leading-relaxed">
                {work.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verificación de persistencia de sesión */}
      <section className="border border-[#E5DDD2] bg-[#F7F3EE] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#5C544D] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
            Monitor de Estado Local (Fase 1)
          </div>
          <p className="text-xs text-[#7A7168] mt-1">
            {session ? (
              <>
                ID de sesión activo:{' '}
                <code className="px-1.5 py-0.5 rounded bg-[#EDE5DB] text-[#4A433D] font-mono">
                  {session.consultationId}
                </code>{' '}
                · Fase: <span className="font-medium text-[#2C2926]">{session.currentPhase}</span>
              </>
            ) : (
              'Inicializando estado de sesión...'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetSession}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A433D] bg-[#FFFFFF] border border-[#D5CCC1] rounded-md hover:bg-[#F3EFE9] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reiniciar sesión local
        </button>
      </section>
    </div>
  );
}
