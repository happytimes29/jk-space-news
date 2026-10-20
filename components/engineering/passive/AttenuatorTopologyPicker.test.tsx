import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AttenuatorTopologyPicker } from "./AttenuatorTopologyPicker";

describe("AttenuatorTopologyPicker", () => {
  it("offers visibly focusable schematic radios with Enter and arrow-key selection", () => {
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = useState<"tee" | "pi">("tee");
      return <AttenuatorTopologyPicker
        value={value}
        onChange={(next) => { onChange(next); setValue(next); }}
        label="Topology"
        hint="Choose the network that matches your layout."
        teeLabel="T network"
        piLabel="Pi network"
      />;
    }

    render(<Harness />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
    expect(screen.getByTestId("topology-card-tee")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("topology-card-tee")).toHaveTextContent("✓");
    expect(screen.getByTestId("topology-card-tee")).toHaveClass("focus-within:ring-2");

    fireEvent.keyDown(radios[1], { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("pi");
    expect(radios[1]).toBeChecked();
    fireEvent.keyDown(radios[1], { key: "ArrowLeft" });
    expect(radios[0]).toBeChecked();
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("pi");
    expect(radios[1]).toBeChecked();
    expect(screen.getByTestId("topology-card-pi")).toHaveAttribute("data-selected", "true");
  });
});
