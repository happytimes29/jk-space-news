import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PcbTestPointTool from "./page";

const { oldContent, newContent } = vi.hoisted(() => ({
  oldContent: `<!doctype html><table><tr><th>RefDes</th><th>SYM_X</th><th>SYM_Y</th></tr><tr><td>TP1</td><td>100</td><td>100</td></tr><tr><td>TP2</td><td>200</td><td>200</td></tr></table>`,
  newContent: `<!doctype html><table><tr><th>RefDes</th><th>SYM_X</th><th>SYM_Y</th></tr><tr><td>TP1</td><td>130</td><td>140</td></tr><tr><td>TP3</td><td>300</td><td>200</td></tr></table>`,
}));

vi.mock("@/lib/pcb-tool/examples", () => ({
  loadExampleFiles: () => Promise.resolve({ oldContent, newContent }),
}));
vi.mock("@/components/pcb-tool/CanvasMap", () => ({
  default: () => <div aria-label="2D coordinate map" />,
}));

let createObjectUrl: ReturnType<typeof vi.fn>;
let revokeObjectUrl: ReturnType<typeof vi.fn>;
let anchorClick: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  createObjectUrl = vi.fn(() => "blob:pcb-csv");
  revokeObjectUrl = vi.fn();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
  anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
});

afterEach(() => {
  anchorClick.mockRestore();
  vi.restoreAllMocks();
});

it("keeps every PCB input inside the isolated application boundary", () => {
  const { container } = render(<PcbTestPointTool />);

  expect(container.firstElementChild).toHaveClass("engineering-app-page", "v2-engineering-shell");
  expect(container.querySelector(".v2-engineering-shell__chrome")).toBeInTheDocument();
  const application = container.querySelector(".engineering-app");
  expect(application).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "PCB Test Point 自動比對工具" })).toBeInTheDocument();
  expect(screen.getByText("舊版 HTML 報表")).toBeInTheDocument();
  expect(screen.getByText("新版 HTML 報表")).toBeInTheDocument();
  expect(screen.getByText("板框 DXF 底圖")).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/TP1, TP2, TP3/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "載入範例" })).toBeInTheDocument();
  expect(Array.from(application!.querySelectorAll("input, button"), (control) =>
    control.tagName === "INPUT"
      ? `input:${control.getAttribute("type")}`
      : `button:${control.textContent?.trim()}`,
  )).toEqual(["button:載入範例", "input:file", "input:file", "input:file", "button:匯入 TXT / CSV", "input:file"]);
});

it("loads the public example, renders comparison results, and exports CSV", async () => {
  render(<PcbTestPointTool />);
  fireEvent.click(screen.getByRole("button", { name: "載入範例" }));

  await waitFor(() => expect(screen.getByText("pcb-test-point-old.html")).toBeInTheDocument());
  expect(screen.getByText("pcb-test-point-new.html")).toBeInTheDocument();
  expect(screen.getAllByText("TP1").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "匯出 CSV" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "匯出 CSV" }));
  expect(createObjectUrl).toHaveBeenCalledOnce();
  expect(anchorClick).toHaveBeenCalledOnce();
  expect(revokeObjectUrl).toHaveBeenCalledWith("blob:pcb-csv");
});
