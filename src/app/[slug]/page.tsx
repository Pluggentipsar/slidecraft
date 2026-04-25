import { notFound } from "next/navigation";
import { getPresentation, getPresentationSlugs } from "@/lib/mdx";
import { PresentationRenderer } from "@/components/PresentationRenderer";

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
    title: presentation.meta.title,
    description: presentation.meta.description,
  };
}

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const presentation = getPresentation(slug);

  if (!presentation) {
    notFound();
  }

  return (
    <PresentationRenderer
      source={presentation.content}
      slug={slug}
      theme={presentation.meta.theme}
      title={presentation.meta.title}
      brand={presentation.meta.brand}
      ambient={presentation.meta.ambient}
    />
  );
}
