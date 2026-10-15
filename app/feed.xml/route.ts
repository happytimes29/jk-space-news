import { NextResponse } from "next/server";
import { getAllNotes } from "@/lib/notes";
import { buildNotesRss } from "@/lib/rss";
import { siteConfig } from "@/lib/site-config";

export async function GET() {
  return new NextResponse(buildNotesRss(await getAllNotes(), siteConfig), {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
