import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ContentMeta } from "./ContentMeta";

it("presents normalized content timestamps as readable dates while preserving machine-readable time", () => {
  render(<ContentMeta role="設計與實作" year={2026} updatedAt="2026-06-10T00:00:00.000Z" />);
  expect(screen.getByText("2026-06-10")).toHaveAttribute("datetime", "2026-06-10T00:00:00.000Z");
  expect(screen.getByText("設計與實作")).toBeVisible();
  expect(screen.getByText("2026")).toBeVisible();
});
