"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

/**
 * Stegsystem för slides med flera byggda steg.
 */

interface SlideStepsContextValue {
  /** Registrera hur många steg sliden har (kallas från templates) */
  registerSteps: (count: number) => void;
  /** Aktuellt step (0-indexerat) */
  currentStep: number;
  /** Totalt antal steg registrerade */
  totalSteps: number;
}

const SlideStepsContext = createContext<SlideStepsContextValue | null>(null);

/**
 * Controller exposar via ref. Används av SlideViewer för att navigera
 * mellan steg utan att hamna i React-closure-helvetet.
 */
export interface StepController {
  /** Returnerar true om step togs, false om slide borde bytas */
  tryNextStep: () => boolean;
  /** Returnerar true om step togs, false om slide borde bytas */
  tryPrevStep: () => boolean;
  /** Sync-status för presenter-vyn */
  getTotalSteps: () => number;
  getCurrentStep: () => number;
}

interface SlideStepsProviderProps {
  slideKey: string | number;
  /** SlideViewer sätter sin ref här och får tillbaka ett kontroll-gränssnitt */
  controllerRef: React.MutableRefObject<StepController | null>;
  children: ReactNode;
}

export function SlideStepsProvider({
  slideKey,
  controllerRef,
  children,
}: SlideStepsProviderProps) {
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Använd refs så controller-funktionerna alltid ser senaste state
  const totalStepsRef = useRef(0);
  const currentStepRef = useRef(0);
  totalStepsRef.current = totalSteps;
  currentStepRef.current = currentStep;

  // Reset när slide BYTS (inte vid initial mount)
  // Eftersom AnimatePresence mount:ar om hela trädet vid slide-byte
  // hanteras reset automatiskt - useState får initialvärde 0 när ny instans
  // skapas. Vi behöver alltså INGEN separat reset-effect, som bara skulle
  // råka skriva över registreringar som sker vid mount.

  const registerSteps = useCallback((count: number) => {
    setTotalSteps((prev) => Math.max(prev, count));
  }, []);

  // Sätt controller-ref så SlideViewer kan kalla den direkt
  useEffect(() => {
    controllerRef.current = {
      tryNextStep: () => {
        const total = totalStepsRef.current;
        const curr = currentStepRef.current;
        if (curr < total - 1) {
          setCurrentStep(curr + 1);
          return true;
        }
        return false;
      },
      tryPrevStep: () => {
        const curr = currentStepRef.current;
        if (curr > 0) {
          setCurrentStep(curr - 1);
          return true;
        }
        return false;
      },
      getTotalSteps: () => totalStepsRef.current,
      getCurrentStep: () => currentStepRef.current,
    };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef]);

  const value = useMemo(
    () => ({ registerSteps, currentStep, totalSteps }),
    [registerSteps, currentStep, totalSteps]
  );

  return <SlideStepsContext.Provider value={value}>{children}</SlideStepsContext.Provider>;
}

/**
 * Hook för templates som vill använda steg. Registrerar `count` steg
 * och returnerar det aktuella stegets index.
 */
export function useSlideSteps(count: number): number {
  const ctx = useContext(SlideStepsContext);

  useEffect(() => {
    if (ctx && count > 0) {
      ctx.registerSteps(count);
    }
  }, [ctx, count]);

  return ctx?.currentStep ?? 0;
}

/**
 * Hook för SlideViewer. Returnerar controller-ref.
 */
export { SlideStepsContext };
