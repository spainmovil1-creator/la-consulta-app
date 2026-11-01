'use client';

import React from 'react';

interface HouseContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HouseContainer
 *
 * Contenedor visual base de La Consulta.
 * Asegura la atmósfera cinematográfica, proporción armónica y soporte responsive
 * desde móvil (320px) hasta pantallas desktop de gran formato sin estirar ni deformar.
 */
export function HouseContainer({ children, className = '' }: HouseContainerProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-[#FBF9F5] text-[#2C2926] overflow-x-hidden selection:bg-[#EAE0D5]">
      {/* Fondo con textura sutil y tono cálido natural característico de La Casa */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.4] bg-[radial-gradient(#DFD7CD_1px,transparent_1px)] [background-size:24px_24px]" 
        aria-hidden="true" 
      />
      
      {/* Marco principal de contenido */}
      <main className={`relative w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 flex flex-col flex-1 ${className}`}>
        {children}
      </main>

      {/* Pie minimalista discreto */}
      <footer className="relative w-full py-6 text-center text-xs tracking-wider text-[#8A8279] uppercase">
        <span>La Consulta · Elena Vargas · Canon 2.0</span>
      </footer>
    </div>
  );
}
