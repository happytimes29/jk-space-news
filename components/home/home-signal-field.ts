export type SignalFieldMode = "interactive" | "static";

export type SignalPoint = Readonly<{ x: number; y: number }>;
export type SignalPointer = SignalPoint | null;

export interface SignalTrace {
  from: SignalPoint;
  to: SignalPoint;
  opacity: number;
}

export interface SignalArc {
  x: number;
  y: number;
  radius: number;
  start: number;
  end: number;
  opacity: number;
}

export interface SignalFrame {
  progress: number;
  nodes: SignalPoint[];
  traces: SignalTrace[];
  smithArcs: SignalArc[];
  signalPath: SignalPoint[];
  matchPoint: SignalPoint | null;
  jkMark: (SignalPoint & { opacity: number }) | null;
}

export function selectSignalFieldMode(input: { reducedMotion: boolean; coarsePointer: boolean; canvasAvailable: boolean }): SignalFieldMode {
  return input.reducedMotion || input.coarsePointer || !input.canvasAvailable ? "static" : "interactive";
}

const normalizedNodes = [
  [0.12, 0.28], [0.22, 0.3], [0.32, 0.2], [0.43, 0.34], [0.55, 0.22],
  [0.69, 0.3], [0.81, 0.22], [0.18, 0.64], [0.31, 0.72], [0.46, 0.6],
  [0.62, 0.72], [0.76, 0.63], [0.88, 0.72],
] as const;

function emptyFrame(progress: number): SignalFrame {
  return { progress, nodes: [], traces: [], smithArcs: [], signalPath: [], matchPoint: null, jkMark: null };
}

export function computeSignalFrame(input: { progress: number; pointer: SignalPointer; width: number; height: number }): SignalFrame {
  const progress = Math.min(1, Math.max(0, Number.isFinite(input.progress) ? input.progress : 0));
  const { width, height, pointer } = input;
  if (!(width > 0) || !(height > 0)) return emptyFrame(progress);

  const pointerRadius = Math.min(width, height) * 0.28;
  const nodes = normalizedNodes.map(([nx, ny], index) => {
    const settle = Math.max(0, (progress - 0.16) / 0.84);
    const targetX = width * (0.18 + (index % 5) * 0.14);
    const targetY = height * (0.28 + Math.floor(index / 5) * 0.22);
    let x = width * nx + (targetX - width * nx) * settle * 0.2;
    let y = height * ny + (targetY - height * ny) * settle * 0.16;
    if (pointer) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < pointerRadius) {
        const influence = (1 - distance / pointerRadius) * 16;
        x += dx / distance * influence;
        y += dy / distance * influence;
      }
    }
    return { x, y };
  });

  const traces = nodes.slice(1).map((node, index) => ({
    from: nodes[index],
    to: node,
    opacity: 0.12 + progress * 0.22,
  }));
  const arcOpacity = Math.max(0, Math.min(1, (progress - 0.18) / 0.55));
  const center = { x: width * 0.58, y: height * 0.5 };
  const smithArcs: SignalArc[] = [0.14, 0.23, 0.32, 0.41].map((scale, index) => ({
    x: center.x + width * (index * 0.025),
    y: center.y,
    radius: Math.min(width, height) * scale,
    start: index % 2 === 0 ? -Math.PI * 0.72 : Math.PI * 0.72,
    end: index % 2 === 0 ? Math.PI * 0.72 : Math.PI * 1.28,
    opacity: arcOpacity * (0.34 + index * 0.12),
  }));
  const matchPoint = { x: width * 0.68, y: height * 0.44 };
  const signalReveal = Math.max(0, Math.min(1, (progress - 0.35) / 0.65));
  const pathStart = { x: width * 0.08, y: height * 0.64 };
  const signalPath = signalReveal === 0 ? [] : [
    pathStart,
    { x: width * 0.28, y: height * (0.64 - signalReveal * 0.13) },
    { x: width * 0.48, y: height * (0.51 - signalReveal * 0.03) },
    matchPoint,
  ];

  return {
    progress,
    nodes,
    traces,
    smithArcs,
    signalPath,
    matchPoint,
    jkMark: { x: width * 0.5, y: height * 0.5, opacity: Math.max(0, (progress - 0.6) / 0.4) },
  };
}
