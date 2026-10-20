import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AttenuatorTopologyPicker } from "./AttenuatorTopologyPicker";

describe("AttenuatorTopologyPicker", () => {
  it("offers two schematic radios and supports arrow-key selection", () => {
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

    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("pi");
    expect(radios[1]).toBeChecked();
    expect(screen.getByTestId("topology-card-pi")).toHaveAttribute("data-selected", "true");
  });
});
