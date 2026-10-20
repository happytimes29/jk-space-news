import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TransmissionLineApp, type TransmissionLineCopy } from "./TransmissionLineApp";

const copy: TransmissionLineCopy = {
  inputTitle: "Geometry", modelLabel: "Model", microstripLabel: "Microstrip", striplineLabel: "Stripline", cpwgLabel: "Grounded CPW", modeLabel: "Mode", forwardLabel: "Analyze", targetModeLabel: "Target impedance", unitLabel: "Display unit", widthLabel: "Width", heightLabel: "Substrate height", planeLabel: "Plane separation", gapLabel: "Gap", thicknessLabel: "Copper thickness", permittivityLabel: "Relative permittivity", frequencyLabel: "Frequency", lengthLabel: "Length", targetLabel: "Target impedance", solveLabel: "Solve width", solvedWidthLabel: "Solved width", resultTitle: "Results", impedanceLabel: "Impedance", effectivePermittivityLabel: "Effective permittivity", velocityLabel: "Phase velocity", wavelengthLabel: "Wavelength", delayLabel: "Delay per metre", angleLabel: "Electrical angle", warningLabel: "Outside recommended model range.", invalidInput: "Check the geometry.", noSolution: "No bounded width solution.", formulaMicrostrip: "Hammerstad-Jensen quasi-static", formulaStripline: "Steer 3.7.1 finite-thickness centered stripline", formulaCpwg: "Qucs 12.10-12.18", privacyNote: "Browser-only ideal model.", diagramTitle: "Geometry diagram", diagramDescription: "Live transmission-line geometry values.", lastValidResultLabel: "Showing the last valid result.", diagram: { width: "W", thickness: "t", height: "h", planes: "b", gap: "s", conductor: "Conductor", dielectric: "Dielectric", ground: "Ground", impedance: "Z0", electricalAngle: "Angle" },
};

beforeEach(() => window.history.replaceState({}, "", "/tools/transmission-line/app"));

describe("TransmissionLineApp", () => {
  it("shows the full forward result and every geometry diagram", async () => {
    render(<TransmissionLineApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    for (const text of ["Impedance", "Effective permittivity", "Phase velocity", "Wavelength", "Delay per metre", "Electrical angle"]) expect(result).toHaveTextContent(text);
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "stripline" } });
    expect(screen.getByRole("img", { name: "Geometry diagram" })).toHaveTextContent("b");
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "cpwg" } });
    expect(screen.getByRole("img", { name: "Geometry diagram" })).toHaveTextContent("s");
  });

  it("switches display units without changing the physical geometry", async () => {
    render(<TransmissionLineApp copy={copy} />);
    expect(screen.getByLabelText("Width")).toHaveValue("3");
    const before = screen.getByTestId("impedance-value").textContent;
    fireEvent.change(screen.getByLabelText("Display unit"), { target: { value: "mil" } });
    expect(Number((screen.getByLabelText("Width") as HTMLInputElement).value)).toBeCloseTo(118.110236, 5);
    await waitFor(() => expect(screen.getByTestId("impedance-value").textContent).toBe(before));
    expect(screen.getByRole("img", { name: "Geometry diagram" })).toHaveTextContent(/118\.110236.*mil/);
    expect(new URL(window.location.href).searchParams.get("widthM")).toBe("0.003");
  });

  it("updates diagram values live and preserves an SI snapshot when input becomes invalid", async () => {
    render(<TransmissionLineApp copy={copy} />);
    const diagram = screen.getByRole("img", { name: "Geometry diagram" });
    expect(diagram).toHaveTextContent("3 mm");
    expect(diagram).toHaveTextContent("0.035 mm");
    expect(diagram).toHaveTextContent("1.6 mm");

    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "4" } });
    await waitFor(() => expect(diagram).toHaveTextContent("4 mm"));
    const validImpedance = screen.getByTestId("impedance-value").textContent;

    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "-1" } });
    expect(await screen.findByText(copy.lastValidResultLabel)).toBeVisible();
    expect(diagram).toHaveAttribute("data-stale", "true");
    expect(diagram).toHaveTextContent("4 mm");
    expect(screen.getByTestId("impedance-value")).toHaveTextContent(validImpedance ?? "");

    fireEvent.change(screen.getByLabelText("Display unit"), { target: { value: "mil" } });
    expect(diagram).toHaveTextContent(/157\.4803.*mil/);
  });

  it("keeps model-range warnings distinct from stale diagram status and maps errors to fields", async () => {
    render(<TransmissionLineApp copy={copy} />);
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "400" } });
    expect(await screen.findByText(copy.warningLabel)).toBeVisible();
    expect(screen.getByRole("img", { name: "Geometry diagram" })).not.toHaveAttribute("data-stale", "true");

    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "-1" } });
    expect(await screen.findByText(copy.lastValidResultLabel)).toBeVisible();
    expect(screen.getByText(copy.warningLabel)).toBeVisible();
    expect(screen.getByLabelText("Width")).toHaveAccessibleDescription(copy.invalidInput);

    fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "target" } });
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Target impedance"), { target: { value: "-50" } });
    fireEvent.click(screen.getByRole("button", { name: "Solve width" }));
    expect(screen.getByLabelText("Target impedance")).toHaveAccessibleDescription(copy.invalidInput);
  });

  it("solves the original width in target mode for every model", async () => {
    render(<TransmissionLineApp copy={copy} />);
    for (const kind of ["microstrip", "stripline", "cpwg"]) {
      fireEvent.change(screen.getByLabelText("Model"), { target: { value: kind } });
      const impedance = Number(screen.getByTestId("impedance-value").textContent?.split(" ")[0]);
      fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "target" } });
      fireEvent.change(screen.getByLabelText("Target impedance"), { target: { value: String(impedance) } });
      fireEvent.click(screen.getByRole("button", { name: "Solve width" }));
      expect(await screen.findByText(/Solved width/)).toBeVisible();
      fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "forward" } });
    }
  });

  it("preserves the last valid result, exposes warnings, and clears stale solved width", async () => {
    render(<TransmissionLineApp copy={copy} />);
    const before = screen.getByTestId("impedance-value").textContent;
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "400" } });
    expect(await screen.findByText(copy.warningLabel)).toBeVisible();
    fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "target" } });
    fireEvent.click(screen.getByRole("button", { name: "Solve width" }));
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "-1" } });
    expect(await screen.findByText(copy.invalidInput)).toBeVisible();
    expect(screen.getByTestId("impedance-value").textContent).toBe(before === screen.getByTestId("impedance-value").textContent ? before : screen.getByTestId("impedance-value").textContent);
    expect(screen.queryByText(/Solved width/)).not.toBeInTheDocument();
  });

  it("invalidates a solved width when target or physical inputs change", async () => {
    render(<TransmissionLineApp copy={copy} />);
    fireEvent.change(screen.getByLabelText("Mode"), { target: { value: "target" } });
    fireEvent.click(screen.getByRole("button", { name: "Solve width" }));
    expect(await screen.findByText(/Solved width/)).toBeVisible();

    fireEvent.change(screen.getByLabelText("Target impedance"), { target: { value: "60" } });
    expect(screen.queryByText(/Solved width/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Solve width" }));
    expect(await screen.findByText(/Solved width/)).toBeVisible();
    fireEvent.change(screen.getByLabelText("Relative permittivity"), { target: { value: "4.1" } });
    expect(screen.queryByText(/Solved width/)).not.toBeInTheDocument();
  });

  it("restores canonical SI geometry from the query string", async () => {
    window.history.replaceState({}, "", "/tools/transmission-line/app?kind=microstrip&unit=mil&widthM=0.003&heightM=0.0016&thicknessM=0.000035&er=4.3&frequency=1G&lengthM=0.1&mode=forward");
    render(<TransmissionLineApp copy={copy} />);
    await waitFor(() => expect(screen.getByLabelText("Display unit")).toHaveValue("mil"));
    expect(Number((screen.getByLabelText("Width") as HTMLInputElement).value)).toBeCloseTo(118.110236, 5);
  });
});
