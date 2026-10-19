import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectsPage from "@/app/(zh-tw)/projects/page";

describe("ProjectsPage", () => {
  it("shows real case studies with the context needed to assess the work", async () => {
    render(await ProjectsPage({ searchParams: Promise.resolve({}) }));
    const pcb = screen.getByRole("article", { name: "PCB 測試點自動比對工具" });
    expect(within(pcb).getByRole("link", { name: "PCB 測試點自動比對工具" })).toHaveAttribute("href", "/projects/pcb-test-point-comparison");
    expect(pcb).toHaveTextContent("設計與實作");
    expect(pcb).toHaveTextContent("維護中");
    expect(pcb).toHaveTextContent("硬體");
    expect(pcb).toHaveTextContent("工具產品");
    expect(pcb).toHaveTextContent("OrCAD");
    expect(pcb).toHaveTextContent("硬體改版時");
    expect(within(pcb).getByText(/成果：/)).toHaveTextContent("測試點");
    const automation = screen.getByRole("article", { name: "JK Space 新聞自動化系統（已封存）" });
    expect(automation).toHaveTextContent("工作流程整合與網站實作");
    expect(automation).toHaveTextContent("已封存");
    expect(within(automation).getByText(/成果：/)).toHaveTextContent("發布");
  });

  it("honors both query filters and preserves their selected values", async () => {
    render(await ProjectsPage({ searchParams: Promise.resolve({ area: "product", status: "archived" }) }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("article")).toHaveAccessibleName("JK Space 新聞自動化系統（已封存）");
    expect(screen.getByRole("combobox", { name: "領域" })).toHaveValue("product");
    expect(screen.getByRole("combobox", { name: "狀態" })).toHaveValue("archived");
  });

  it("offers a reset destination without placeholder cards when filters have no results", async () => {
    render(await ProjectsPage({ searchParams: Promise.resolve({ area: "hardware", status: "archived" }) }));
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByText("沒有符合篩選條件的專案")).toBeVisible();
    expect(screen.getByRole("link", { name: "清除篩選" })).toHaveAttribute("href", "/projects");
  });
});
