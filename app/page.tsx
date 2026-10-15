import { getFeaturedProjects } from "@/lib/projects";
import { getFeaturedTool } from "@/lib/tools";
import { getRecentNotes } from "@/lib/notes";
import { loadNow } from "@/lib/now";
import { selectHomeContent } from "@/lib/home";
import { HomePageContent } from "@/components/home/HomePageContent";

export default async function HomePage() {
  const [projects, tool, notes] = await Promise.all([getFeaturedProjects(), getFeaturedTool(), getRecentNotes()]);
  return <HomePageContent {...selectHomeContent(projects, tool ? [tool] : [], notes)} now={loadNow()} />;
}
