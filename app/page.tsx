import { getFeaturedProjects } from "@/lib/projects";
import { getFeaturedTool } from "@/lib/tools";
import { getRecentNotes } from "@/lib/notes";
import { loadNow } from "@/lib/now";
import { selectHomeContent } from "@/lib/home";
import { HomePageContent } from "@/components/home/HomePageContent";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [projects, tool, notes] = await Promise.all([getFeaturedProjects(), getFeaturedTool(), getRecentNotes()]);
  return <>
    <JsonLd data={personJsonLd(siteConfig)} />
    <JsonLd data={websiteJsonLd(siteConfig)} />
    <HomePageContent {...selectHomeContent(projects, tool ? [tool] : [], notes)} now={loadNow()} />
  </>;
}
