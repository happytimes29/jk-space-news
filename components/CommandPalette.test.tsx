import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import { getDictionary } from "@/lib/i18n/dictionaries";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const items = [
  { title: "PCB 比較專案", href: "/projects/pcb", type: "project" as const, label: "硬體" },
  { title: "報表比較工具", href: "/tools/report", type: "tool" as const, label: "CSV" },
  { title: "量測方法", href: "/notes/testing", type: "note" as const, label: "工程筆記" },
];
const openPalette = () => fireEvent.keyDown(document, { key: "k", metaKey: true });
const props = { locale: "en" as const, dictionary: getDictionary("en") };

describe("CommandPalette", () => {
  beforeEach(() => push.mockClear());

  it("shows all three content types and navigates directly to the selected href", () => {
    render(<CommandPalette items={items} {...props} />);
    openPalette();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /報表比較工具/ }));
    expect(push).toHaveBeenCalledWith("/tools/report");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("preserves Ctrl+K, arrow navigation, Enter, and Escape", () => {
    render(<CommandPalette items={items} {...props} />);
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
    render(<CommandPalette items={items} {...props} />);
    openPalette();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "csv" } });
    expect(screen.getByRole("button", { name: /報表比較工具/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /PCB 比較專案/ })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: "note" } });
    expect(screen.getByRole("button", { name: /量測方法/ })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "missing" } });
    expect(screen.getByText("No matching content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/en/projects");
    expect(screen.getByRole("link", { name: "Tools" })).toHaveAttribute("href", "/en/tools");
    expect(screen.getByRole("link", { name: "Notes & Perspectives" })).toHaveAttribute("href", "/en/notes");
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "PCB" } });
    fireEvent.keyDown(document, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/projects/pcb");
  });
});
