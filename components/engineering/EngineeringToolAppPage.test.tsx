import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { EngineeringToolAppPage } from "./EngineeringToolAppPage";
import { EngineeringToolShell } from "./EngineeringToolShell";

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("next/navigation", () => ({ notFound }));

beforeEach(() => {
  notFound.mockClear();
  window.history.replaceState({}, "", "/en/tools/engineering-converter/app");
});

it("renders a reviewed localized application in preview", async () => {
  const { container } = render(await EngineeringToolAppPage({ locale: "en", slug: "engineering-converter", visibility: "preview" }));
  expect(container.firstElementChild).toHaveClass("engineering-app-page");
  expect(container.querySelector(".engineering-app")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "Engineering Unit and RF Power Converter" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to tool overview/ })).toHaveAttribute("href", "/en/tools/engineering-converter");
  expect(screen.getByText("All values are calculated in the browser and are not sent to a server.")).toBeInTheDocument();
});

it("renders an application exactly once inside the isolated engineering boundary", () => {
  const { container } = render(<EngineeringToolShell
    title="RF utility"
    description="A focused engineering workflow."
    backHref="/tools/rf"
    backLabel="Back to tool overview"
    privacy="Calculated locally."
    application={<div data-testid="application-sentinel">Application</div>}
  />);

  expect(container.firstElementChild).toHaveClass("engineering-app-page");
  expect(container.querySelectorAll(".engineering-app [data-testid='application-sentinel']")).toHaveLength(1);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByText("Calculated locally.")).toBeInTheDocument();
});

it("does not expose a reviewed localized application in production", async () => {
  await expect(EngineeringToolAppPage({ locale: "en", slug: "engineering-converter", visibility: "production" })).rejects.toThrow("NEXT_NOT_FOUND");
  expect(notFound).toHaveBeenCalledOnce();
});

it("does not resolve unregistered slugs", async () => {
  await expect(EngineeringToolAppPage({ locale: "zh-TW", slug: "constructor", visibility: "preview" })).rejects.toThrow("NEXT_NOT_FOUND");
});
