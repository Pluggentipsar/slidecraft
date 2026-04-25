import { notFound } from "next/navigation";
import { getPresentation, getPresentationSlugs } from "@/lib/mdx";
import { parseMdx } from "@/lib/mdx-parser";
import { EditorView } from "@/components/editor/EditorView";

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
    title: `Redigera: ${presentation.meta.title}`,
  };
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const presentation = getPresentation(slug);
  if (!presentation) notFound();

  const parsed = parseMdx(presentation.raw);

  return <EditorView slug={slug} meta={presentation.meta} initialParsed={parsed} />;
}
