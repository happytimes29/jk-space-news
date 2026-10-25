"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DropZone from "@/components/pcb-tool/DropZone";
import TargetListInput from "@/components/pcb-tool/TargetListInput";
import SummaryBadges from "@/components/pcb-tool/SummaryBadges";
import ResultTable from "@/components/pcb-tool/ResultTable";
import { parseHTML, parseTargetList } from "@/lib/pcb-tool/parser";
import { parseDXF } from "@/lib/pcb-tool/parseDXF";
import { compareTestPoints } from "@/lib/pcb-tool/compare";
import { loadExampleFiles } from "@/lib/pcb-tool/examples";
import { TestPoint, CompareResult, ChangeStatus, DXFData } from "@/lib/pcb-tool/types";

const CanvasMap = dynamic(() => import("@/components/pcb-tool/CanvasMap"), { ssr: false });

interface FileState {
  name: string;
  points: TestPoint[];
}

export default function PcbTestPointTool() {
  const [oldFile, setOldFile] = useState<FileState | null>(null);
  const [newFile, setNewFile] = useState<FileState | null>(null);
  const [dxfData, setDxfData] = useState<DXFData | null>(null);
  const [targetText, setTargetText] = useState("");
  const [filter, setFilter] = useState<ChangeStatus | "all">("all");
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [exampleError, setExampleError] = useState("");

  const handleOldFile = useCallback((content: string, filename: string) => {
    const points = parseHTML(content);
    setOldFile({ name: filename, points });
  }, []);

  const handleNewFile = useCallback((content: string, filename: string) => {
    const points = parseHTML(content);
    setNewFile({ name: filename, points });
  }, []);

  const handleDXFFile = useCallback((content: string, filename: string) => {
    const data = parseDXF(content, filename);
    setDxfData(data);
  }, []);

  const targetSet = useMemo(() => parseTargetList(targetText), [targetText]);

  const results: CompareResult[] = useMemo(() => {
    if (!oldFile || !newFile) return [];
    return compareTestPoints(
      oldFile.points,
      newFile.points,
      targetSet.size > 0 ? targetSet : undefined
    );
  }, [oldFile, newFile, targetSet]);

  const hasResults = results.length > 0;

  const handleLoadExamples = async () => {
    setLoadingExamples(true);
    setExampleError("");
    try {
      const { oldContent, newContent } = await loadExampleFiles();
      handleOldFile(oldContent, "pcb-test-point-old.html");
      handleNewFile(newContent, "pcb-test-point-new.html");
      setTargetText("");
      setFilter("all");
      setDxfData(null);
    } catch {
      setExampleError("無法載入範例，請重試或選取本機 HTML 報表。");
    } finally {
      setLoadingExamples(false);
    }
  };

  const exportCSV = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10);
    const headers = ["RefDes", "Status", "Old X (mil)", "Old Y (mil)", "New X (mil)", "New Y (mil)", "ΔX (mil)", "ΔY (mil)", "Distance (mil)"];
    const statusLabel: Record<string, string> = { moved: "Moved", added: "Added", removed: "Removed", unchanged: "Unchanged" };
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = results.map((r) => [
      escape(r.refDes),
      escape(statusLabel[r.status] ?? r.status),
      r.oldX !== undefined ? r.oldX.toFixed(2) : "",
      r.oldY !== undefined ? r.oldY.toFixed(2) : "",
      r.newX !== undefined ? r.newX.toFixed(2) : "",
      r.newY !== undefined ? r.newY.toFixed(2) : "",
      r.deltaX !== undefined ? r.deltaX.toFixed(2) : "",
      r.deltaY !== undefined ? r.deltaY.toFixed(2) : "",
      r.distance !== undefined ? r.distance.toFixed(2) : "",
    ]);
    const csv = "\ufeff" + [headers.map(escape), ...rows].map((row) => row.join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pcb-tp-diff_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div className="engineering-app-page pcb-tool-page">
      <header className="engineering-app-shell pcb-tool-shell">
        <div className="pcb-tool-shell__bar">
          <Link
            href="/tools/pcb-test-point"
            className="pcb-tool-shell__back"
          >
            <ChevronLeft size={14} />
            返回工具介紹
          </Link>
          <div className="pcb-tool-shell__mark">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <p className="engineering-app-shell__kicker">Engineering utility / PCB revision</p>
            <h1>PCB Test Point 自動比對工具</h1>
            <p>OrCAD HTML 報表測試點座標差異分析</p>
          </div>
        </div>
      </header>

      <div className="engineering-app pcb-engineering-app min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section aria-label="隱私與範例" className="rounded-lg border border-[#30363d] bg-[#161b22] p-5">
          <p className="font-medium">資料不離開瀏覽器</p>
          <p className="mt-2 text-sm text-[#8b949e]">本機 HTML、DXF 與 Target List 只在此瀏覽器記憶體中處理，不上傳伺服器。重新整理會清除資料。</p>
          <p className="mt-2 text-sm text-[#8b949e]">可先載入公開的合成範例；這會取代目前報表，並清除 Target List、篩選與 DXF 底圖。</p>
          <button type="button" onClick={handleLoadExamples} disabled={loadingExamples} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {loadingExamples ? "載入中…" : "載入範例"}
          </button>
          {exampleError && <p role="alert" className="mt-3 text-sm text-red-300">{exampleError}</p>}
        </section>
        {/* Step 1 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e]">Step 1 — 上傳零件配置檔</h2>

          <div className="rounded-lg px-5 py-4 bg-[#161b22] border border-[#30363d]">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#8b949e]">操作步驟</p>
            <ol className="flex flex-col gap-2">
              {["在 OrCAD 中打開舊版 PCB，點選 Tools → Reports。",
                "匯出包含 RefDes、SYM_X、SYM_Y 的 HTML 表格報表（.html / .htm）。",
                "重複上述步驟，匯出新版 PCB 的報表。",
                "匯入 PCB 的 DXF 檔（選填）。",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#8b949e]">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 bg-[#21262d] border border-[#30363d] text-[#8b949e]">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">A</span>
                <span className="text-sm font-medium text-[#e6edf3]">Old Placement</span>
              </div>
              <DropZone label="舊版 HTML 報表" sublabel="OrCAD 匯出，含 RefDes / SYM_X / SYM_Y" onFile={handleOldFile} fileName={oldFile?.name} recordCount={oldFile?.points.length} colorClass="border-[#30363d]" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[rgba(88,166,255,0.15)] text-[#58a6ff] border border-[#1f6feb]">B</span>
                <span className="text-sm font-medium text-[#e6edf3]">New Placement</span>
              </div>
              <DropZone label="新版 HTML 報表" sublabel="OrCAD 匯出，含 RefDes / SYM_X / SYM_Y" onFile={handleNewFile} fileName={newFile?.name} recordCount={newFile?.points.length} colorClass="border-[#1f6feb]" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[rgba(59,130,246,0.08)] text-[#6b7280] border border-[#374151]">D</span>
                <span className="text-sm font-medium text-[#e6edf3]">PCB Outline DXF <span className="ml-1.5 text-xs font-normal text-[#8b949e]">選填</span></span>
              </div>
              <DropZone label="板框 DXF 底圖" sublabel="Edge.Cuts / Board Outline 圖層" accept=".dxf" onFile={handleDXFFile} fileName={dxfData?.fileName} recordCount={dxfData?.entities.length} recordLabel="個圖元" colorClass="border-dashed border-[#374151]" />
            </div>
          </div>

          <TargetListInput value={targetText} onChange={setTargetText} targetCount={targetSet.size} />
        </section>

        {hasResults && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e]">Step 2 — 比對結果</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <SummaryBadges results={results} activeFilter={filter} onFilter={setFilter} />
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#30363d] text-[#8b949e] bg-[#21262d] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  匯出 CSV
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#8b949e]">2D 座標分布圖{dxfData && <span className="ml-2 text-[#6b7280]">· 含板框底圖</span>}</p>
              <CanvasMap results={results} dxfData={dxfData} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#8b949e]">明細資料表</p>
              <div className="rounded-xl overflow-hidden border border-[#30363d] bg-[#161b22]">
                <ResultTable results={results} filter={filter} />
              </div>
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
  );
}
