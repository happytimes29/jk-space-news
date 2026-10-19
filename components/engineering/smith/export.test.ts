import { afterEach, describe, expect, it, vi } from "vitest";
import { exportSmithChartPng } from "./export";

afterEach(() => vi.restoreAllMocks());

describe("Smith chart PNG export", () => {
  it("renders the chart with a summary and revokes temporary object URLs", async () => {
    const urls = ["blob:chart", "blob:png"];
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => urls.shift()) });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    class LoadedImage {
      onload?: () => void;
      onerror?: () => void;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    }
    vi.stubGlobal("Image", LoadedImage);
    const fillText = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "", font: "", fillRect: vi.fn(), drawImage: vi.fn(), fillText,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob(["png"], { type: "image/png" })));
    let downloaded = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { downloaded = this.download; });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "var(--color-accent)");
    path.setAttribute("fill", "var(--color-card)");
    svg.append(path);

    await exportSmithChartPng(svg, { title: "Smith chart", frequency: "1 GHz", reference: "50 Ω", result: "25 + j0 Ω" }, "network.png");

    expect(downloaded).toBe("network.png");
    const serializedSvg = await (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0].text();
    expect(serializedSvg).not.toContain("var(--");
    expect(serializedSvg).toContain("#");
    expect(fillText.mock.calls.map(([text]) => text)).toEqual(["Smith chart", "1 GHz · 50 Ω", "25 + j0 Ω"]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:chart");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:png");
  });
});
