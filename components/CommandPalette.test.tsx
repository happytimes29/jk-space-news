import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const items = [
  { title: "PCB 比較專案", href: "/projects/pcb", type: "project" as const, label: "硬體" },
  { title: "報表比較工具", href: "/tools/report", type: "tool" as const, label: "CSV" },
  { title: "量測方法", href: "/notes/testing", type: "note" as const, label: "工程筆記" },
];
const openPalette = () => fireEvent.keyDown(document, { key: "k", metaKey: true });

describe("CommandPalette", () => {
  beforeEach(() => push.mockClear());

  it("shows all three content types and navigates directly to the selected href", () => {
    render(<CommandPalette items={items} />);
    openPalette();
    expect(screen.getByText("專案")).toBeInTheDocument();
    expect(screen.getByText("工具")).toBeInTheDocument();
    expect(screen.getByText("筆記")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /報表比較工具/ }));
    expect(push).toHaveBeenCalledWith("/tools/report");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("preserves Ctrl+K, arrow navigation, Enter, and Escape", () => {
    render(<CommandPalette items={items} />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByRole("textbox")).toHaveFocus();
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "ArrowUp" });
    fireEvent.keyDown(document, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/tools/report");
    openPalette();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("searches labels and type and offers real collection links when nothing matches", () => {
    render(<CommandPalette items={items} />);
    openPalette();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "csv" } });
    expect(screen.getByRole("button", { name: /報表比較工具/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /PCB 比較專案/ })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: "note" } });
    expect(screen.getByRole("button", { name: /量測方法/ })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "missing" } });
    expect(screen.getByText("找不到相關內容")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "專案" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "工具" })).toHaveAttribute("href", "/tools");
    expect(screen.getByRole("link", { name: "筆記與觀點" })).toHaveAttribute("href", "/notes");
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "PCB" } });
    fireEvent.keyDown(document, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/projects/pcb");
  });
});
