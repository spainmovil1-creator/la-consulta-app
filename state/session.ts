/**
 * STATE LAYER — SESSION UTILS
 *
 * Utilidades para inicializar y gestionar la sesión de La Consulta.
 * Implementa sincronización segura con almacenamiento local sin cascada de renders.
 */

import { useSyncExternalStore } from 'react';
import type { ConsultationSession } from './types';

const STORAGE_KEY = 'la_consulta_session_v1';

let memorySession: ConsultationSession | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function createInitialSession(): ConsultationSession {
  return {
    consultationId: `session_${Date.now()}`,
    currentPhase: 'intro',
    currentQuestionIndex: 0,
    answers: [],
    startedAt: new Date().toISOString(),
  };
}

export function loadSession(): ConsultationSession | null {
  if (typeof window === 'undefined') return null;
  if (memorySession) return memorySession;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memorySession = JSON.parse(raw) as ConsultationSession;
      return memorySession;
    }
  } catch {
    // Manejo de entornos restringidos
  }

  const fresh = createInitialSession();
  memorySession = fresh;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // Silencioso
  }
  return memorySession;
}

export function saveSession(session: ConsultationSession): void {
  memorySession = session;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignorar en sandbox
    }
  }
  notifyListeners();
}

export function clearSession(): void {
  const fresh = createInitialSession();
  memorySession = fresh;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignorar
    }
  }
  notifyListeners();
}

export function subscribeSession(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useSession(): ConsultationSession | null {
  return useSyncExternalStore(
    subscribeSession,
    () => loadSession(),
    () => null
  );
}
