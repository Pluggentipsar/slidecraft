/**
 * Synkronisering mellan huvudfönster och presenter-fönster via BroadcastChannel.
 *
 * Huvudfönstret (SlideViewer) är "master" - det skickar slide-ändringar.
 * Presenter-fönstret lyssnar och följer med.
 * Presenter-fönstret kan också skicka navigation-kommandon tillbaka.
 */

export type PresenterMessage =
  | { type: "slide-changed"; slideIndex: number; slug: string }
  | { type: "request-current"; slug: string }
  | { type: "navigate"; direction: "next" | "prev"; slug: string }
  | { type: "goto"; slideIndex: number; slug: string };

const CHANNEL_NAME = "slidecraft-presenter";

export function getPresenterChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}
