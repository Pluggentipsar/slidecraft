"use client";

import type { MutableRefObject, ReactNode } from "react";
import { SlideStepsProvider, type StepController } from "@/lib/slide-steps";

interface SlideWithStepsProps {
  slideKey: number;
  controllerRef: MutableRefObject<StepController | null>;
  children: ReactNode;
}

/**
 * Wrapper som tillhandahåller steps-context till sliden.
 * SlideViewer håller i controllerRef och kan läsa aktuella step-värden.
 */
export function SlideWithSteps({ slideKey, controllerRef, children }: SlideWithStepsProps) {
  return (
    <SlideStepsProvider slideKey={slideKey} controllerRef={controllerRef}>
      {children}
    </SlideStepsProvider>
  );
}
