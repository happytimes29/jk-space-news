import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ContentMeta } from "./ContentMeta";

it("presents normalized content timestamps as readable dates while preserving machine-readable time", () => {
  render(<ContentMeta locale="zh-TW" role="設計與實作" year={2026} updatedAt="2026-06-10T00:00:00.000Z" />);
  expect(screen.getByText("2026-06-10")).toHaveAttribute("datetime", "2026-06-10T00:00:00.000Z");
  expect(screen.getByText("設計與實作")).toBeVisible();
  expect(screen.getByText("2026")).toBeVisible();
});

it("localizes metadata labels", () => {
  render(<ContentMeta locale="en" role="Design" year={2026} updatedAt="2026-06-10T00:00:00.000Z" />);
  expect(screen.getByText("Role")).toBeVisible();
  expect(screen.getByText("Year")).toBeVisible();
  expect(screen.getByText("Last updated")).toBeVisible();
});
