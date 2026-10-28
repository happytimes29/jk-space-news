import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { expect, it } from "vitest";

it("separates the editorial index from the section heading and action", async () => {
  const componentPath = path.join(process.cwd(), "components", "editorial", "EditorialSectionHeading.tsx");
  expect(fs.existsSync(componentPath)).toBe(true);
  if (!fs.existsSync(componentPath)) return;

  const { EditorialSectionHeading } = await import("./EditorialSectionHeading");
  const { container } = render(
    <EditorialSectionHeading
      index="02"
      title="Selected work"
      action={<Link href="/projects">View all</Link>}
    />,
  );

  expect(container.firstElementChild).toHaveClass("editorial-section-heading", "v2-section-heading");
  expect(screen.getByText("02")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByText("02")).toHaveClass("v2-section-heading__index");
  expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View all" }).parentElement).toHaveClass("v2-section-heading__action");
  expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute("href", "/projects");
});
