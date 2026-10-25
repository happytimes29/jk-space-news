"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { SourceEvidence } from "@/lib/datasheet/types";

const LABELS: Record<Locale, { show: (count: number) => string; page: (page: number) => string; open: (page: number) => string }> = {
  "zh-TW": { show: (count) => `顯示來源（${count}）`, page: (page) => `第 ${page} 頁`, open: (page) => `查看 PDF 第 ${page} 頁` },
  "zh-CN": { show: (count) => `显示来源（${count}）`, page: (page) => `第 ${page} 页`, open: (page) => `查看 PDF 第 ${page} 页` },
  en: { show: (count) => `Show sources (${count})`, page: (page) => `Page ${page}`, open: (page) => `View PDF page ${page}` },
};

function PdfPageCanvas({ file, pageNumber }: { file: File; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    let destroy: (() => Promise<void>) | undefined;
    void (async () => {
      const bytes = typeof file.arrayBuffer === "function" ? await file.arrayBuffer() : await new Response(file).arrayBuffer();
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      }
      const task = pdfjs.getDocument({ data: new Uint8Array(bytes) });
      destroy = () => task.destroy();
      const pdf = await task.promise;
      if (cancelled) return;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.15 });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || cancelled) return;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;
    })().catch(() => {
      // Switching modes or pages destroys the PDF.js task. That expected abort
      // must not become an unhandled browser rejection.
    });
    return () => {
      cancelled = true;
      void destroy?.();
    };
  }, [file, pageNumber]);
  return <canvas ref={canvasRef} className="datasheet-pdf-page" aria-label={`PDF page ${pageNumber}`} />;
}

export function SourceEvidencePanel({ locale, evidence, file, onOpenPage, defaultOpen = false }: {
  locale: Locale;
  evidence: readonly SourceEvidence[];
  file?: File;
  onOpenPage?: (page: number) => void;
  defaultOpen?: boolean;
}) {
  const labels = LABELS[locale];
  const [open, setOpen] = useState(defaultOpen);
  const [previewPage, setPreviewPage] = useState<number>();
  if (evidence.length === 0) return null;
  return (
    <div className="datasheet-evidence">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{labels.show(evidence.length)}</button>
      {open && <ol>
        {evidence.map((source, index) => <li key={`${source.chunkHash}-${index}`}>
          <div className="datasheet-evidence__meta">
            <span>{labels.page(source.page)}</span>
            {source.section && <span>{source.section}</span>}
            {source.table && <span>{source.table}</span>}
          </div>
          <blockquote>{source.quote}</blockquote>
          <button type="button" onClick={() => {
            onOpenPage?.(source.page);
            if (file) setPreviewPage(source.page);
          }}>{labels.open(source.page)}</button>
        </li>)}
      </ol>}
      {file && previewPage && <PdfPageCanvas file={file} pageNumber={previewPage} />}
    </div>
  );
}

