import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { EngineeringToolAppPage } from "./EngineeringToolAppPage";

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("next/navigation", () => ({ notFound }));

beforeEach(() => {
  notFound.mockClear();
  window.history.replaceState({}, "", "/en/tools/engineering-converter/app");
});

it("renders a reviewed localized application in preview", async () => {
  render(await EngineeringToolAppPage({ locale: "en", slug: "engineering-converter", visibility: "preview" }));
  expect(screen.getByRole("heading", { level: 1, name: "Engineering Unit and RF Power Converter" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to tool overview/ })).toHaveAttribute("href", "/en/tools/engineering-converter");
});

it("does not expose a reviewed localized application in production", async () => {
  await expect(EngineeringToolAppPage({ locale: "en", slug: "engineering-converter", visibility: "production" })).rejects.toThrow("NEXT_NOT_FOUND");
  expect(notFound).toHaveBeenCalledOnce();
});

it("does not resolve unregistered slugs", async () => {
  await expect(EngineeringToolAppPage({ locale: "zh-TW", slug: "constructor", visibility: "preview" })).rejects.toThrow("NEXT_NOT_FOUND");
});
