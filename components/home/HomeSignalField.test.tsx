import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HomeSignalField } from "./HomeSignalField";

const label = "Signal paths converging into the JK circuit mark";

function media(reducedMotion: boolean, coarsePointer: boolean) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reducedMotion : coarsePointer,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe(target: Element) { this.callback([{ target, contentRect: { width: 800, height: 500 } } as ResizeObserverEntry], this as unknown as ResizeObserver); }
    unobserve() {}
    disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) { this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = "0px";
    thresholds = [0];
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("renders the labeled completed composition without a render loop for reduced motion", async () => {
  media(true, false);
  const requestFrame = vi.spyOn(window, "requestAnimationFrame");

  render(<HomeSignalField label={label} />);

  const figure = screen.getByRole("img", { name: label });
  await waitFor(() => expect(figure).toHaveAttribute("data-mode", "static"));
  expect(screen.getByTestId("signal-field-static")).toBeVisible();
  expect(figure.querySelector("canvas")).toBeNull();
  expect(requestFrame).not.toHaveBeenCalled();
});

it("uses Canvas and schedules drawing for a visible fine-pointer field", async () => {
  media(false, false);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D);
  const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);

  render(<HomeSignalField label={label} />);

  const figure = screen.getByRole("img", { name: label });
  await waitFor(() => expect(figure).toHaveAttribute("data-mode", "interactive"));
  expect(figure.querySelector("canvas")).toBeInTheDocument();
  expect(requestFrame).toHaveBeenCalled();
});
