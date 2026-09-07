export interface ImpositionInput {
  paperWidth: number;
  paperHeight: number;
  objectWidth: number;
  objectHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  horizontalGap: number;
  verticalGap: number;
  allowRotation?: boolean | undefined;
  quantity?: number | undefined;
}

export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  page: number;
}

export interface ImpositionResult {
  columns: number;
  rows: number;
  perPage: number;
  positions: Placement[];
  pagesRequired: number;
  usedPercent: number;
  wastePercent: number;
  rotated: boolean;
}

const EPS = 0.01;

function grid(
  input: ImpositionInput,
  ow: number,
  oh: number,
): { cols: number; rows: number } {
  const availW =
    input.paperWidth - input.marginLeft - input.marginRight + input.horizontalGap;
  const availH =
    input.paperHeight - input.marginTop - input.marginBottom + input.verticalGap;
  const cols = Math.floor((availW + EPS) / (ow + input.horizontalGap));
  const rows = Math.floor((availH + EPS) / (oh + input.verticalGap));
  return { cols: Math.max(0, cols), rows: Math.max(0, rows) };
}

/** Imposition engine: tests both object orientations and returns the best fit. */
export function computeImposition(input: ImpositionInput): ImpositionResult {
  const candidates: { ow: number; oh: number; rotated: boolean }[] = [
    { ow: input.objectWidth, oh: input.objectHeight, rotated: false },
  ];
  if (input.allowRotation !== false) {
    candidates.push({ ow: input.objectHeight, oh: input.objectWidth, rotated: true });
  }

  let best: ImpositionResult | null = null;

  for (const c of candidates) {
    const { cols, rows } = grid(input, c.ow, c.oh);
    const perPage = cols * rows;
    if (perPage === 0) continue;

    const quantity = Math.max(1, input.quantity ?? perPage);
    const pagesRequired = Math.ceil(quantity / perPage);
    const positions: Placement[] = [];

    for (let i = 0; i < quantity; i++) {
      const page = Math.floor(i / perPage);
      const idx = i % perPage;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      positions.push({
        x: input.marginLeft + col * (c.ow + input.horizontalGap),
        y: input.marginTop + row * (c.oh + input.verticalGap),
        width: c.ow,
        height: c.oh,
        rotation: 0,
        page,
      });
    }

    const pageArea = input.paperWidth * input.paperHeight;
    const used = (perPage * c.ow * c.oh) / pageArea;
    const result: ImpositionResult = {
      columns: cols,
      rows,
      perPage,
      positions,
      pagesRequired,
      usedPercent: Math.round(used * 1000) / 10,
      wastePercent: Math.round((1 - used) * 1000) / 10,
      rotated: c.rotated,
    };
    if (!best || result.perPage > best.perPage) best = result;
  }

  return (
    best ?? {
      columns: 0,
      rows: 0,
      perPage: 0,
      positions: [],
      pagesRequired: 0,
      usedPercent: 0,
      wastePercent: 100,
      rotated: false,
    }
  );
}

/** Fit a source aspect ratio into a box, returning the drawn rect (mm). */
export function fitRect(
  boxW: number,
  boxH: number,
  srcW: number,
  srcH: number,
  mode: "fit" | "fill" | "stretch",
) {
  if (mode === "stretch" || !srcW || !srcH) return { w: boxW, h: boxH };
  const scale =
    mode === "fit"
      ? Math.min(boxW / srcW, boxH / srcH)
      : Math.max(boxW / srcW, boxH / srcH);
  return { w: srcW * scale, h: srcH * scale };
}
