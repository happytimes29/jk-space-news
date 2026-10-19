import { render, screen } from "@testing-library/react";
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
