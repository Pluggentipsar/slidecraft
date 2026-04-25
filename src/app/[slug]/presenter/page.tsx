import { notFound } from "next/navigation";
import { getPresentation, getPresentationSlugs } from "@/lib/mdx";
import { extractNotes } from "@/lib/extract-notes";
import { PresenterView } from "@/components/PresenterView";

export function generateStaticParams() {
  return getPresentationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const presentation = getPresentation(slug);
  if (!presentation) return {};
  return {
    title: `${presentation.meta.title} - Presenter mode`,
  };
}

export default async function PresenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const presentation = getPresentation(slug);

  if (!presentation) {
    notFound();
  }

  const { notes } = extractNotes(presentation.content);

  return <PresenterView slug={slug} meta={presentation.meta} notes={notes} />;
}
