import { MDXRemote } from "next-mdx-remote/rsc";
import {
  TitleSlide,
  GiantText,
  Quote,
  ImageText,
  BulletBuild,
  PromptAnimation,
  StatCounter,
  Comparison,
  ComparisonColumn,
  CodeReveal,
  VideoEmbed,
  HeroImage,
  LayeredText,
  ImageBleed,
  Collage,
  SideScrollList,
  NumberedReveal,
  Timeline,
  TimelineEvent,
  GiantScroll,
  LayeredScroll,
  VideoBackground,
  ParticleField,
  LoadingSlide,
  SlideshowMorph,
  PollQuestion,
  Callout,
  SectionDivider,
  PictureQuote,
  Reflection,
  VoiceCollage,
  EmotionRow,
  BeforeAfter,
  Outro,
  StatCompare,
  Passage,
  MapPins,
  VideoChapters,
  HotspotImage,
  AiConversation,
  ChatPreview,
  BrandIntro,
  BigStat,
  MetricGrid,
  TierStack,
  SpotlightContrast,
  SpotlightCard,
  TeamIntro,
  TeamMember,
  SpeakerIntro,
  AiArHero,
  AiArMedia,
  RealOrFake,
  PromptWindow,
  AiKanVara,
  AiHyperobject,
  NamedPortrait,
  FigureQuote,
  ErrorSlide,
  FullscreenVideo,
  SamrLadder,
  PromptHero,
  ChatHero,
  InputHero,
  CodeGeneration,
  Manifesto,
  EditorialHero,
  ProcessChain,
  ThreeUp,
  StudentVoices,
  HeroStatement,
  TwoPaths,
  StatsTriptych,
  GrowingStatement,
  ChatFullscreen,
  VibeCoding,
  StarterSentences,
  Bollplank,
  BloomComparison,
  ThreeActs,
  Pitfall,
  PromptPrinciples,
  AgentCatalog,
  ExampleGrid,
  LixPanels,
  TranslationDemo,
  QuizDemo,
  VoiceFeedback,
  RotatingStatement,
  ChatSplit,
  EditorialQuote,
  HookStatement,
  RevealList,
  UCurveChart,
  NoviceDilemma,
  LivePoll,
  TriadStatement,
  TwoSides,
  EvidenceConstellation,
  FrictionMap,
  StrategySpectrum,
  LensIntro,
  DualAffordance,
  SAMRSpectrum,
  AcronymList,
  BloomPyramid,
  JagAIJagFlow,
  LensApplication,
  BeforeAfterPhases,
  InvisibleChildPatterns,
} from "@/templates";
import { Slide } from "./Slide";
import { SlideViewer } from "./SlideViewer";
import { extractNotes } from "@/lib/extract-notes";
import { extractSlideMetas } from "@/lib/extract-slide-types";
import { extractMediaUrls } from "@/lib/extract-media-urls";
import { getTheme, themeToCssVars } from "@/themes";
import { PresentationPreloader } from "./PresentationPreloader";
import type { BrandWatermark } from "@/lib/types";

interface PresentationRendererProps {
  source: string;
  slug?: string;
  theme?: string;
  title?: string;
  brand?: BrandWatermark;
  ambient?: boolean | string;
}

// Notes: <Notes>...</Notes> blocks parsas ut innan MDX-rendering
// (se extractNotes). De finns inte kvar i MDX-källkoden när den når MDXRemote.
const mdxComponents = {
  Slide,
  TitleSlide,
  GiantText,
  Quote,
  ImageText,
  BulletBuild,
  PromptAnimation,
  StatCounter,
  Comparison,
  ComparisonColumn,
  CodeReveal,
  VideoEmbed,
  HeroImage,
  LayeredText,
  ImageBleed,
  Collage,
  SideScrollList,
  NumberedReveal,
  Timeline,
  TimelineEvent,
  GiantScroll,
  LayeredScroll,
  VideoBackground,
  ParticleField,
  LoadingSlide,
  SlideshowMorph,
  PollQuestion,
  Callout,
  SectionDivider,
  PictureQuote,
  Reflection,
  VoiceCollage,
  EmotionRow,
  BeforeAfter,
  Outro,
  StatCompare,
  Passage,
  MapPins,
  VideoChapters,
  HotspotImage,
  AiConversation,
  ChatPreview,
  BrandIntro,
  BigStat,
  MetricGrid,
  TierStack,
  SpotlightContrast,
  SpotlightCard,
  TeamIntro,
  TeamMember,
  SpeakerIntro,
  AiArHero,
  AiArMedia,
  RealOrFake,
  PromptWindow,
  AiKanVara,
  AiHyperobject,
  NamedPortrait,
  FigureQuote,
  ErrorSlide,
  FullscreenVideo,
  SamrLadder,
  PromptHero,
  ChatHero,
  InputHero,
  CodeGeneration,
  Manifesto,
  EditorialHero,
  ProcessChain,
  ThreeUp,
  StudentVoices,
  HeroStatement,
  TwoPaths,
  StatsTriptych,
  GrowingStatement,
  ChatFullscreen,
  VibeCoding,
  StarterSentences,
  Bollplank,
  BloomComparison,
  ThreeActs,
  Pitfall,
  PromptPrinciples,
  AgentCatalog,
  ExampleGrid,
  LixPanels,
  TranslationDemo,
  QuizDemo,
  VoiceFeedback,
  RotatingStatement,
  ChatSplit,
  EditorialQuote,
  HookStatement,
  RevealList,
  UCurveChart,
  NoviceDilemma,
  LivePoll,
  TriadStatement,
  TwoSides,
  EvidenceConstellation,
  FrictionMap,
  StrategySpectrum,
  LensIntro,
  DualAffordance,
  SAMRSpectrum,
  AcronymList,
  BloomPyramid,
  JagAIJagFlow,
  LensApplication,
  BeforeAfterPhases,
  InvisibleChildPatterns,
};

export async function PresentationRenderer({ source, slug, theme, title, brand, ambient }: PresentationRendererProps) {
  const { content, notes } = extractNotes(source);
  const slideMetas = extractSlideMetas(content);
  // Samla alla media-URL:er för preload (server-side för att undvika hydration-mismatch).
  const mediaUrls = extractMediaUrls(content);
  const themeTokens = getTheme(theme);
  const cssVars = themeToCssVars(themeTokens);

  return (
    <div
      style={cssVars as React.CSSProperties}
      data-ornament={themeTokens.ornamentStyle}
      data-theme={theme ?? "default"}
      className="h-screen w-screen"
    >
      <PresentationPreloader
        slug={slug ?? "unknown"}
        title={title ?? slug ?? "Presentation"}
        mediaUrls={mediaUrls}
      >
        <SlideViewer
          notes={notes}
          slideMetas={slideMetas}
          slug={slug}
          theme={theme ?? "default"}
          title={title}
          brand={brand}
          ambient={ambient}
        >
          <MDXRemote source={content} components={mdxComponents} />
        </SlideViewer>
      </PresentationPreloader>
    </div>
  );
}
