export interface SmithExportSummary {
  title: string;
  frequency: string;
  reference: string;
  result: string;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to render Smith chart"));
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to encode PNG")), "image/png"));
}

const EXPORT_COLOR_FALLBACKS: Record<string, string> = {
  "--accent-green": "#37805b",
  "--accent-orange": "#c96f38",
  "--color-accent": "#9c4f24",
  "--color-border": "#c9c2b8",
  "--color-card": "#ffffff",
  "--color-muted": "#665f56",
  "--color-text": "#211d16",
};

function resolvedColor(value: string | null, rootStyle: CSSStyleDeclaration): string | null {
  if (!value?.includes("var(")) return value;
  return value.replace(/var\((--[\w-]+)(?:,[^)]+)?\)/g, (_match, name: string) => {
    const resolved = rootStyle.getPropertyValue(name).trim();
    return resolved || EXPORT_COLOR_FALLBACKS[name] || "#211d16";
  });
}

function inlineSvgColors(source: SVGSVGElement, clone: SVGSVGElement): void {
  const rootStyle = getComputedStyle(document.documentElement);
  const sourceNodes = [source, ...source.querySelectorAll<SVGElement>("*")];
  const cloneNodes = [clone, ...clone.querySelectorAll<SVGElement>("*")];
  sourceNodes.forEach((node, index) => {
    const target = cloneNodes[index];
    if (!target) return;
    for (const property of ["fill", "stroke", "color"] as const) {
      const raw = node.getAttribute(property);
      if (!raw) continue;
      const computed = getComputedStyle(node)[property];
      target.setAttribute(property, raw.includes("var(")
        ? resolvedColor(raw, rootStyle) ?? raw
        : computed && !computed.includes("var(") ? computed : raw);
    }
  });
  clone.style.background = resolvedColor("var(--color-card)", rootStyle) ?? "#ffffff";
  clone.style.color = resolvedColor("var(--color-text)", rootStyle) ?? "#211d16";
}

export async function exportSmithChartPng(svg: SVGSVGElement, summary: SmithExportSummary, filename: string): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", "1024");
  clone.setAttribute("height", "1024");
  inlineSvgColors(svg, clone);
  const source = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  let pngUrl: string | undefined;
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1160;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, 1024, 1024);
    context.fillStyle = "#211d16";
    context.font = "600 24px sans-serif";
    context.fillText(summary.title, 32, 1060);
    context.font = "18px monospace";
    context.fillText(`${summary.frequency} · ${summary.reference}`, 32, 1095);
    context.fillText(summary.result, 32, 1130);
    const blob = await canvasBlob(canvas);
    pngUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(svgUrl);
    if (pngUrl) URL.revokeObjectURL(pngUrl);
  }
}
