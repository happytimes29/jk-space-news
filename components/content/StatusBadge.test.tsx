import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

it.each([
  ["active", "進行中"], ["completed", "已完成"], ["maintained", "維護中"], ["archived", "已封存"],
  ["available", "可使用"], ["experimental", "實驗中"], ["maintenance", "維護中"],
] as const)("makes %s status understandable in Chinese", (status, label) => {
  render(<StatusBadge status={status} locale="zh-TW" />);
  expect(screen.getByText(label)).toBeVisible();
});

it("localizes status labels", () => {
  render(<StatusBadge status="maintained" locale="en" />);
  expect(screen.getByText("Maintained")).toBeVisible();
});
