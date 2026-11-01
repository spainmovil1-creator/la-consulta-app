'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { Check, ArrowRight, RotateCcw } from 'lucide-react';
import { AnswerRegistration } from './QuestionScreen';

interface ValidationScreenProps {
  answer: AnswerRegistration;
  onNextQuestion?: () => void;
  nextQuestionLabel?: string;
  onRetryQuestion: () => void;
  onBackToPrevious?: () => void;
  backToPreviousLabel?: string;
  onResetAll: () => void;
  isLastAvailableQuestion?: boolean;
}

export function ValidationScreen({
  answer,
  onNextQuestion,
  nextQuestionLabel,
  onRetryQuestion,
  onBackToPrevious,
  backToPreviousLabel,
  onResetAll,
  isLastAvailableQuestion = false,
}: ValidationScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#16110D] flex items-center justify-center p-4 sm:p-6 text-[#EDE7DF] select-none">
      {/* Atmósfera difusa */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <img
          src={`/images/${answer.questionId}.png`}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover blur-3xl scale-125 opacity-25 brightness-50"
        />
      </div>

      {/* BARRA SUPERIOR DISCRETA */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onRetryQuestion}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614]/85 hover:bg-[#181614] text-[#E0D5C7]/90 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
          title="Probar otra tarjeta"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform text-[#C4B5A5]" />
          <span>Probar otra opción en {answer.questionId}</span>
        </button>

        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181614]/85 hover:bg-[#181614] text-[#E0D5C7]/80 hover:text-[#FFFFFF] text-xs font-medium backdrop-blur-md border border-[#3E3833]/70 transition-all cursor-pointer shadow-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0D5C7]"
          title="Reiniciar flujo"
        >
          <span>Reiniciar Intro</span>
        </button>
      </div>

      {/* CONTENEDOR DE VALIDACIÓN TÉCNICA */}
      <div className="relative z-10 max-w-lg w-full bg-[#1F1A16]/95 border border-[#3E3833] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-[#2C241E] border border-[#524438] mx-auto flex items-center justify-center text-[#81C784]">
          <Check className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B3A494] block">
            La Consulta · Validación Técnica
          </span>
          <h2 className="text-2xl font-serif text-[#FBF9F5]">
            Pregunta {answer.questionNumber} completada
          </h2>
        </div>

        {/* DETALLE EXACTO DEL REGISTRO Y MAPPING */}
        <div className="py-3 px-4 rounded-xl bg-[#16120E] border border-[#332C25] text-left space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center text-[#C4B5A5]">
            <span>Pregunta:</span>
            <strong className="text-white">{answer.questionId} (Pregunta {answer.questionNumber} / 15)</strong>
          </div>
          <div className="flex justify-between items-center text-[#C4B5A5]">
            <span>Tarjeta pulsada:</span>
            <strong className="text-white text-sm">Opción {answer.key}</strong>
          </div>
          <div className="flex justify-between items-center text-[#C4B5A5] pt-1 border-t border-[#26201B]">
            <span>Correspondencia obligatoria:</span>
            <strong className="text-[#81C784]">Respuesta {answer.responseNumber}</strong>
          </div>
          <div className="text-[10px] text-[#8C7A6B] text-center pt-1">
            Mapping verificado: A→1, B→2, C→3, D→4
          </div>
        </div>

        <p className="text-xs text-[#A89E92] font-light leading-relaxed">
          {isLastAvailableQuestion
            ? `${answer.questionId} completada con éxito. Siguiendo las instrucciones, la experiencia se detiene aquí sin avanzar todavía a la siguiente pregunta.`
            : 'Respuesta registrada correctamente en el motor. Puedes avanzar a la siguiente pregunta o volver a probar otra tarjeta.'}
        </p>

        {/* ACCIONES DE NAVEGACIÓN Y PRUEBA */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          {!isLastAvailableQuestion && onNextQuestion && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5EFE6] text-[#2C2926] text-xs font-semibold hover:bg-[#FFFFFF] transition-all cursor-pointer shadow-md"
            >
              <span>{nextQuestionLabel || `Continuar a Pregunta ${answer.questionNumber + 1}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onRetryQuestion}
            className="px-4 py-2.5 rounded-lg bg-[#3D352E] text-[#FBF9F5] text-xs font-medium hover:bg-[#4E443B] transition-all cursor-pointer shadow"
          >
            Probar otra opción (A / B / C / D)
          </button>

          {onBackToPrevious && (
            <button
              type="button"
              onClick={onBackToPrevious}
              className="px-4 py-2.5 rounded-lg bg-transparent border border-[#524941] text-[#D4C8BC] text-xs font-medium hover:bg-[#342D26] transition-all cursor-pointer"
            >
              {backToPreviousLabel || `Volver a P0${answer.questionNumber - 1}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
