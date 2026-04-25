"use client";

import { useRef } from "react";
import type { ComponentType } from "react";
import type { ParsedComponent } from "@/lib/mdx-parser";
import { markdownToReact } from "@/lib/mini-markdown";
import { SlideStepsProvider, type StepController } from "@/lib/slide-steps";
import { EditProvider } from "@/lib/inline-edit";
import * as Templates from "@/templates";

/**
 * Registry: tag-namn i MDX → React-komponent.
 * Måste innehålla alla top-level slide-templates OCH nested components
 * (TimelineEvent, ComparisonColumn).
 */
const REGISTRY: Record<string, ComponentType<Record<string, unknown>>> = {
  TitleSlide: Templates.TitleSlide as unknown as ComponentType<Record<string, unknown>>,
  GiantText: Templates.GiantText as unknown as ComponentType<Record<string, unknown>>,
  Quote: Templates.Quote as unknown as ComponentType<Record<string, unknown>>,
  ImageText: Templates.ImageText as unknown as ComponentType<Record<string, unknown>>,
  BulletBuild: Templates.BulletBuild as unknown as ComponentType<Record<string, unknown>>,
  PromptAnimation: Templates.PromptAnimation as unknown as ComponentType<Record<string, unknown>>,
  StatCounter: Templates.StatCounter as unknown as ComponentType<Record<string, unknown>>,
  Comparison: Templates.Comparison as unknown as ComponentType<Record<string, unknown>>,
  ComparisonColumn: Templates.ComparisonColumn as unknown as ComponentType<Record<string, unknown>>,
  CodeReveal: Templates.CodeReveal as unknown as ComponentType<Record<string, unknown>>,
  VideoEmbed: Templates.VideoEmbed as unknown as ComponentType<Record<string, unknown>>,
  HeroImage: Templates.HeroImage as unknown as ComponentType<Record<string, unknown>>,
  LayeredText: Templates.LayeredText as unknown as ComponentType<Record<string, unknown>>,
  ImageBleed: Templates.ImageBleed as unknown as ComponentType<Record<string, unknown>>,
  Collage: Templates.Collage as unknown as ComponentType<Record<string, unknown>>,
  SideScrollList: Templates.SideScrollList as unknown as ComponentType<Record<string, unknown>>,
  NumberedReveal: Templates.NumberedReveal as unknown as ComponentType<Record<string, unknown>>,
  Timeline: Templates.Timeline as unknown as ComponentType<Record<string, unknown>>,
  TimelineEvent: Templates.TimelineEvent as unknown as ComponentType<Record<string, unknown>>,
  GiantScroll: Templates.GiantScroll as unknown as ComponentType<Record<string, unknown>>,
  LayeredScroll: Templates.LayeredScroll as unknown as ComponentType<Record<string, unknown>>,
  VideoBackground: Templates.VideoBackground as unknown as ComponentType<Record<string, unknown>>,
  ParticleField: Templates.ParticleField as unknown as ComponentType<Record<string, unknown>>,
  LoadingSlide: Templates.LoadingSlide as unknown as ComponentType<Record<string, unknown>>,
  SlideshowMorph: Templates.SlideshowMorph as unknown as ComponentType<Record<string, unknown>>,
  PollQuestion: Templates.PollQuestion as unknown as ComponentType<Record<string, unknown>>,
  Callout: Templates.Callout as unknown as ComponentType<Record<string, unknown>>,
  SectionDivider: Templates.SectionDivider as unknown as ComponentType<Record<string, unknown>>,
  PictureQuote: Templates.PictureQuote as unknown as ComponentType<Record<string, unknown>>,
  Reflection: Templates.Reflection as unknown as ComponentType<Record<string, unknown>>,
  VoiceCollage: Templates.VoiceCollage as unknown as ComponentType<Record<string, unknown>>,
  EmotionRow: Templates.EmotionRow as unknown as ComponentType<Record<string, unknown>>,
  BeforeAfter: Templates.BeforeAfter as unknown as ComponentType<Record<string, unknown>>,
  Outro: Templates.Outro as unknown as ComponentType<Record<string, unknown>>,
  StatCompare: Templates.StatCompare as unknown as ComponentType<Record<string, unknown>>,
  Passage: Templates.Passage as unknown as ComponentType<Record<string, unknown>>,
  MapPins: Templates.MapPins as unknown as ComponentType<Record<string, unknown>>,
  VideoChapters: Templates.VideoChapters as unknown as ComponentType<Record<string, unknown>>,
  HotspotImage: Templates.HotspotImage as unknown as ComponentType<Record<string, unknown>>,
  AiConversation: Templates.AiConversation as unknown as ComponentType<Record<string, unknown>>,
  BrandIntro: Templates.BrandIntro as unknown as ComponentType<Record<string, unknown>>,
  BigStat: Templates.BigStat as unknown as ComponentType<Record<string, unknown>>,
  ChatPreview: Templates.ChatPreview as unknown as ComponentType<Record<string, unknown>>,
  MetricGrid: Templates.MetricGrid as unknown as ComponentType<Record<string, unknown>>,
  TierStack: Templates.TierStack as unknown as ComponentType<Record<string, unknown>>,
  SpotlightContrast: Templates.SpotlightContrast as unknown as ComponentType<Record<string, unknown>>,
  SpotlightCard: Templates.SpotlightCard as unknown as ComponentType<Record<string, unknown>>,
  TeamIntro: Templates.TeamIntro as unknown as ComponentType<Record<string, unknown>>,
  TeamMember: Templates.TeamMember as unknown as ComponentType<Record<string, unknown>>,
  SpeakerIntro: Templates.SpeakerIntro as unknown as ComponentType<Record<string, unknown>>,
  AiArHero: Templates.AiArHero as unknown as ComponentType<Record<string, unknown>>,
  AiArMedia: Templates.AiArMedia as unknown as ComponentType<Record<string, unknown>>,
  RealOrFake: Templates.RealOrFake as unknown as ComponentType<Record<string, unknown>>,
  PromptWindow: Templates.PromptWindow as unknown as ComponentType<Record<string, unknown>>,
  AiKanVara: Templates.AiKanVara as unknown as ComponentType<Record<string, unknown>>,
  AiHyperobject: Templates.AiHyperobject as unknown as ComponentType<Record<string, unknown>>,
  NamedPortrait: Templates.NamedPortrait as unknown as ComponentType<Record<string, unknown>>,
  FigureQuote: Templates.FigureQuote as unknown as ComponentType<Record<string, unknown>>,
  ErrorSlide: Templates.ErrorSlide as unknown as ComponentType<Record<string, unknown>>,
  FullscreenVideo: Templates.FullscreenVideo as unknown as ComponentType<Record<string, unknown>>,
  SamrLadder: Templates.SamrLadder as unknown as ComponentType<Record<string, unknown>>,
  PromptHero: Templates.PromptHero as unknown as ComponentType<Record<string, unknown>>,
  ChatHero: Templates.ChatHero as unknown as ComponentType<Record<string, unknown>>,
  InputHero: Templates.InputHero as unknown as ComponentType<Record<string, unknown>>,
  CodeGeneration: Templates.CodeGeneration as unknown as ComponentType<Record<string, unknown>>,
  Manifesto: Templates.Manifesto as unknown as ComponentType<Record<string, unknown>>,
  EditorialHero: Templates.EditorialHero as unknown as ComponentType<Record<string, unknown>>,
  ProcessChain: Templates.ProcessChain as unknown as ComponentType<Record<string, unknown>>,
  ThreeUp: Templates.ThreeUp as unknown as ComponentType<Record<string, unknown>>,
  StudentVoices: Templates.StudentVoices as unknown as ComponentType<Record<string, unknown>>,
  HeroStatement: Templates.HeroStatement as unknown as ComponentType<Record<string, unknown>>,
  TwoPaths: Templates.TwoPaths as unknown as ComponentType<Record<string, unknown>>,
  StatsTriptych: Templates.StatsTriptych as unknown as ComponentType<Record<string, unknown>>,
  GrowingStatement: Templates.GrowingStatement as unknown as ComponentType<Record<string, unknown>>,
  ChatFullscreen: Templates.ChatFullscreen as unknown as ComponentType<Record<string, unknown>>,
  VibeCoding: Templates.VibeCoding as unknown as ComponentType<Record<string, unknown>>,
  StarterSentences: Templates.StarterSentences as unknown as ComponentType<Record<string, unknown>>,
  Bollplank: Templates.Bollplank as unknown as ComponentType<Record<string, unknown>>,
  BloomComparison: Templates.BloomComparison as unknown as ComponentType<Record<string, unknown>>,
  ThreeActs: Templates.ThreeActs as unknown as ComponentType<Record<string, unknown>>,
  Pitfall: Templates.Pitfall as unknown as ComponentType<Record<string, unknown>>,
  PromptPrinciples: Templates.PromptPrinciples as unknown as ComponentType<Record<string, unknown>>,
  AgentCatalog: Templates.AgentCatalog as unknown as ComponentType<Record<string, unknown>>,
  ExampleGrid: Templates.ExampleGrid as unknown as ComponentType<Record<string, unknown>>,
  LixPanels: Templates.LixPanels as unknown as ComponentType<Record<string, unknown>>,
  TranslationDemo: Templates.TranslationDemo as unknown as ComponentType<Record<string, unknown>>,
  QuizDemo: Templates.QuizDemo as unknown as ComponentType<Record<string, unknown>>,
  VoiceFeedback: Templates.VoiceFeedback as unknown as ComponentType<Record<string, unknown>>,
  RotatingStatement: Templates.RotatingStatement as unknown as ComponentType<Record<string, unknown>>,
  ChatSplit: Templates.ChatSplit as unknown as ComponentType<Record<string, unknown>>,
  EditorialQuote: Templates.EditorialQuote as unknown as ComponentType<Record<string, unknown>>,
  HookStatement: Templates.HookStatement as unknown as ComponentType<Record<string, unknown>>,
  RevealList: Templates.RevealList as unknown as ComponentType<Record<string, unknown>>,
  UCurveChart: Templates.UCurveChart as unknown as ComponentType<Record<string, unknown>>,
  NoviceDilemma: Templates.NoviceDilemma as unknown as ComponentType<Record<string, unknown>>,
  LivePoll: Templates.LivePoll as unknown as ComponentType<Record<string, unknown>>,
  TriadStatement: Templates.TriadStatement as unknown as ComponentType<Record<string, unknown>>,
  TwoSides: Templates.TwoSides as unknown as ComponentType<Record<string, unknown>>,
  EvidenceConstellation: Templates.EvidenceConstellation as unknown as ComponentType<Record<string, unknown>>,
  FrictionMap: Templates.FrictionMap as unknown as ComponentType<Record<string, unknown>>,
  StrategySpectrum: Templates.StrategySpectrum as unknown as ComponentType<Record<string, unknown>>,
  LensIntro: Templates.LensIntro as unknown as ComponentType<Record<string, unknown>>,
  DualAffordance: Templates.DualAffordance as unknown as ComponentType<Record<string, unknown>>,
  SAMRSpectrum: Templates.SAMRSpectrum as unknown as ComponentType<Record<string, unknown>>,
  AcronymList: Templates.AcronymList as unknown as ComponentType<Record<string, unknown>>,
  BloomPyramid: Templates.BloomPyramid as unknown as ComponentType<Record<string, unknown>>,
  JagAIJagFlow: Templates.JagAIJagFlow as unknown as ComponentType<Record<string, unknown>>,
  LensApplication: Templates.LensApplication as unknown as ComponentType<Record<string, unknown>>,
  BeforeAfterPhases: Templates.BeforeAfterPhases as unknown as ComponentType<Record<string, unknown>>,
};

interface SlideRendererProps {
  slide: ParsedComponent;
  /** Unik key per slide — byts när slide ändras så state reset:as (steg-system) */
  slideKey: string | number;
  /** Inline-edit-mode: när true kan man klicka på text i preview för att redigera direkt. */
  editMode?: boolean;
  /** Callback när en prop uppdateras via inline-editorn. */
  onUpdateProp?: (propName: string, value: string) => void;
  /** Callback när markdown-children uppdateras via inline-editorn. */
  onUpdateContent?: (content: string) => void;
}

/**
 * Renderar en ParsedComponent direkt som React-tree.
 *
 * Används av editorns live-preview: ändringar i fält ger omedelbar
 * visuell feedback, ingen iframe-reload, ingen save-latens.
 *
 * Wrappar i SlideStepsProvider så templates som använder useSlideSteps
 * (NumberedReveal, Timeline, PollQuestion m.fl.) fungerar korrekt.
 *
 * Wrappar också i EditProvider så templates som använder <EditableText>
 * får tillgång till edit-mode-flaggan och update-callbacks.
 */
export function SlideRenderer({
  slide,
  slideKey,
  editMode = false,
  onUpdateProp,
  onUpdateContent,
}: SlideRendererProps) {
  const controllerRef = useRef<StepController | null>(null);

  return (
    <EditProvider
      editMode={editMode}
      slideContent={slide.content ?? ""}
      updateProp={onUpdateProp ?? (() => {})}
      updateContent={onUpdateContent ?? (() => {})}
    >
      <SlideStepsProvider slideKey={slideKey} controllerRef={controllerRef}>
        {renderComponent(slide)}
      </SlideStepsProvider>
    </EditProvider>
  );
}

function renderComponent(comp: ParsedComponent, key?: React.Key): React.ReactNode {
  const Component = REGISTRY[comp.tag];

  if (!Component) {
    return (
      <div
        key={key}
        className="flex h-full items-center justify-center bg-red-950/40 p-8 text-center text-red-300"
      >
        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-red-400">
            Okänd template
          </div>
          <div className="font-mono">{comp.tag}</div>
        </div>
      </div>
    );
  }

  // Bygg children: nested ParsedComponents har företräde, annars markdown från content
  let children: React.ReactNode = null;
  if (comp.children.length > 0) {
    children = comp.children.map((c, i) => renderComponent(c, i));
  } else if (comp.content != null && comp.content.trim() !== "") {
    children = markdownToReact(comp.content);
  }

  // Filtrera bort null/undefined/true boolean props (MDX shorthand)
  const cleanProps: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(comp.props)) {
    if (v !== null && v !== undefined) cleanProps[k] = v;
  }

  return (
    <Component key={key} {...cleanProps}>
      {children}
    </Component>
  );
}
