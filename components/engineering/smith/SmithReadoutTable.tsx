import type { SmithReadout } from "@/lib/engineering/smith";

export interface SmithReadoutLabels {
  table: string;
  impedance: string;
  admittance: string;
  gamma: string;
  s11: string;
  vswr: string;
  returnLoss: string;
  mismatchLoss: string;
}

function number(value: number): string {
  if (value === Number.POSITIVE_INFINITY) return "∞";
  if (value === Number.NEGATIVE_INFINITY) return "−∞";
  if (Object.is(value, -0) || value === 0) return "0";
  return Number(value.toPrecision(6)).toString();
}

function complex(value: { rectangular: { re: number; im: number }; magnitude: number; phaseDegrees: number }, unit = "") {
  const sign = value.rectangular.im < 0 ? "−" : "+";
  const suffix = unit ? ` ${unit}` : "";
  return `${number(value.rectangular.re)} ${sign} j${number(Math.abs(value.rectangular.im))}${suffix} · ${number(value.magnitude)} ∠ ${number(value.phaseDegrees)}°`;
}

export function SmithReadoutTable({ readout, labels }: { readout: SmithReadout; labels: SmithReadoutLabels }) {
  const rows = [
    [labels.impedance, complex(readout.impedance, "Ω")],
    [labels.admittance, readout.admittance ? complex(readout.admittance, "S") : "∞"],
    [labels.gamma, complex(readout.gamma)],
    [labels.s11, `${number(readout.s11Db)} dB`],
    [labels.vswr, number(readout.vswr)],
    [labels.returnLoss, `${number(readout.returnLossDb)} dB`],
    [labels.mismatchLoss, `${number(readout.mismatchLossDb)} dB`],
  ];
  return <div className="overflow-x-auto"><table aria-label={labels.table} className="w-full text-left text-sm"><tbody>{rows.map(([label, value]) => <tr key={label} className="border-b border-[var(--color-border)]"><th className="py-2 pr-4 font-medium">{label}</th><td className="py-2 font-mono">{value}</td></tr>)}</tbody></table></div>;
}
