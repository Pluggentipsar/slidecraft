"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * OverlayContext signalerar till children att de är inom en overlay-wrapper.
 * Används av FloatingImage för att veta om den ska rendera som standalone
 * eller som overlay (utan slide-container-wrapper).
 */
const OverlayContext = createContext(false);

export function useIsOverlay(): boolean {
  return useContext(OverlayContext);
}

/**
 * OverlayInstanceContext — per-overlay callbacks för update + delete.
 *
 * När en overlay (FloatingImage) renderas inom SlideWithOverlays via vår
 * editor, sätts denna context med specifika callbacks som muterar parent
 * slidens overlays-array istället för parent slidens egna props.
 *
 * Utan detta skulle FloatingImage:s drag/resize uppdatera parent slidens
 * x/y/width-props (eftersom EditProvider's updateProp pekar på parent).
 */
export interface OverlayInstanceValue {
  /** Uppdatera en prop på denna specifika overlay. */
  onUpdateProp?: (propName: string, value: string) => void;
  /** Ta bort denna overlay från sliden. */
  onDelete?: () => void;
}

const OverlayInstanceContext = createContext<OverlayInstanceValue>({});

export function useOverlayInstance(): OverlayInstanceValue {
  return useContext(OverlayInstanceContext);
}

interface OverlayInstanceProviderProps {
  value: OverlayInstanceValue;
  children?: ReactNode;
}

export function OverlayInstanceProvider({ value, children }: OverlayInstanceProviderProps) {
  return (
    <OverlayInstanceContext.Provider value={value}>
      {children}
    </OverlayInstanceContext.Provider>
  );
}

interface SlideWithOverlaysProps {
  children?: ReactNode;
}

/**
 * SlideWithOverlays — wrapper för en slide där en template renderas tillsammans
 * med en eller flera överlay-komponenter (FloatingImage, etc.).
 *
 * Genereras automatiskt av:
 *  - mdx-parser i editor-läget (för SlideRenderer)
 *  - preprocessOverlaysForPresenter i presenter-läget (för MDXRemote)
 *
 * Layout: position:relative container som fyller slide-canvasen. Templaten
 * (med h-full w-full) fyller hela ytan; overlays positioneras absolut ovanpå.
 *
 * Exempel på MDX som genereras (efter pre-processing):
 *
 * ```mdx
 * <SlideWithOverlays>
 *   <HookStatement chapter="..." background="...">
 *     Det handlar inte om att **fixa allt**.
 *   </HookStatement>
 *   <FloatingImage src="..." x="20%" y="30%" width="200px" />
 * </SlideWithOverlays>
 * ```
 */
export function SlideWithOverlays({ children }: SlideWithOverlaysProps) {
  return (
    <OverlayContext.Provider value={true}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </OverlayContext.Provider>
  );
}
