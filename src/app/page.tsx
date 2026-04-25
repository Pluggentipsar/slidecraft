import { getAllPresentations } from "@/lib/mdx";
import { HomeDashboard } from "@/components/HomeDashboard";
import { BodyScrollEffect } from "@/components/BodyScrollEffect";

export default function HomePage() {
  const presentations = getAllPresentations();
  return (
    <>
      <BodyScrollEffect />
      <HomeDashboard presentations={presentations} />
    </>
  );
}
