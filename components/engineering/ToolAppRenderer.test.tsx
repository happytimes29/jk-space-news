import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ToolAppRenderer } from "./ToolAppRenderer";

it("selects applications from the static registered map", () => {
  const { rerender } = render(<ToolAppRenderer slug="engineering-converter" locale="en" />);
  expect(screen.getByRole("tab", { name: "General units" })).toBeInTheDocument();
  rerender(<ToolAppRenderer slug="passive-circuit-calculator" locale="en" />);
  expect(screen.getByRole("tab", { name: "Divider" })).toBeInTheDocument();
  rerender(<ToolAppRenderer slug="rf-calculator" locale="en" />);
  expect(screen.getByRole("tab", { name: "Propagation" })).toBeInTheDocument();
});

it("renders the localized datasheet workbench from the registry", () => {
  render(<ToolAppRenderer slug="datasheet-workbench" locale="en" />);
  expect(screen.getByRole("tab", { name: "Quick read" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Replacement check" })).toBeInTheDocument();
});

it.each([
  ["zh-TW", "/tools/smith-chart/app"],
  ["zh-CN", "/zh-cn/tools/smith-chart/app"],
  ["en", "/en/tools/smith-chart/app"],
] as const)("keeps the %s locale in the RF Smith-chart link", (locale, href) => {
  render(<ToolAppRenderer slug="rf-calculator" locale={locale} />);
  fireEvent.click(screen.getAllByRole("tab")[1]);
  expect(screen.getByRole("link", { name: /史密斯圖|史密斯图|Smith chart/i })).toHaveAttribute("href", href);
});
