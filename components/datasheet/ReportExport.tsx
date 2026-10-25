"use client";

import { serializeJson, serializeMarkdown, type WorkbenchReport } from "@/lib/datasheet/report";

export type ReportDownloader = (fileName: string, content: string, mediaType: string) => void;

export const browserDownload: ReportDownloader = (fileName, content, mediaType) => {
  const url = URL.createObjectURL(new Blob([content], { type: mediaType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export function ReportExport({ report, download = browserDownload }: { report: WorkbenchReport; download?: ReportDownloader }) {
  return <div className="datasheet-report-export">
    <button type="button" onClick={() => download("datasheet-replacement.md", serializeMarkdown(report), "text/markdown;charset=utf-8")}>Download Markdown</button>
    <button type="button" onClick={() => download("datasheet-replacement.json", serializeJson(report), "application/json;charset=utf-8")}>Download JSON</button>
  </div>;
}
