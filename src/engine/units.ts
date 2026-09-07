import type { Orientation, Unit } from "@/types/project";

export const MM_PER_IN = 25.4;
export const PT_PER_MM = 72 / MM_PER_IN;

export const mmToPt = (mm: number) => mm * PT_PER_MM;
export const mmToIn = (mm: number) => mm / MM_PER_IN;

export function toMm(value: number, unit: Unit, dpi = 96): number {
  switch (unit) {
    case "mm":
      return value;
    case "cm":
      return value * 10;
    case "in":
      return value * MM_PER_IN;
    case "px":
      return (value / dpi) * MM_PER_IN;
  }
}

export function fromMm(mm: number, unit: Unit, dpi = 96): number {
  switch (unit) {
    case "mm":
      return mm;
    case "cm":
      return mm / 10;
    case "in":
      return mm / MM_PER_IN;
    case "px":
      return (mm / MM_PER_IN) * dpi;
  }
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PaperSize {
  id: string;
  label: string;
  /** portrait dimensions in mm */
  w: number;
  h: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { id: "A0", label: "A0 — 841 × 1189 mm", w: 841, h: 1189 },
  { id: "A1", label: "A1 — 594 × 841 mm", w: 594, h: 841 },
  { id: "A2", label: "A2 — 420 × 594 mm", w: 420, h: 594 },
  { id: "A3", label: "A3 — 297 × 420 mm", w: 297, h: 420 },
  { id: "A4", label: "A4 — 210 × 297 mm", w: 210, h: 297 },
  { id: "A5", label: "A5 — 148 × 210 mm", w: 148, h: 210 },
  { id: "A6", label: "A6 — 105 × 148 mm", w: 105, h: 148 },
  { id: "Letter", label: "Letter — 216 × 279 mm", w: 216, h: 279 },
  { id: "Legal", label: "Legal — 216 × 356 mm", w: 216, h: 356 },
  { id: "Tabloid", label: "Tabloid — 279 × 432 mm", w: 279, h: 432 },
  { id: "Custom", label: "Custom size", w: 210, h: 297 },
];

export function paperById(id: string) {
  return PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[4];
}

export function orientedSize(id: string, orientation: Orientation) {
  const p = paperById(id);
  return orientation === "landscape"
    ? { width: Math.max(p.w, p.h), height: Math.min(p.w, p.h) }
    : { width: Math.min(p.w, p.h), height: Math.max(p.w, p.h) };
}

export const OBJECT_PRESETS: { id: string; label: string; w: number; h: number }[] = [
  { id: "A3", label: "A3 (297 × 420)", w: 297, h: 420 },
  { id: "A4", label: "A4 (210 × 297)", w: 210, h: 297 },
  { id: "A5", label: "A5 (148 × 210)", w: 148, h: 210 },
  { id: "A6", label: "A6 (105 × 148)", w: 105, h: 148 },
  { id: "photo6x4", label: 'Photo 6 × 4"', w: 152.4, h: 101.6 },
  { id: "photo7x5", label: 'Photo 7 × 5"', w: 177.8, h: 127 },
  { id: "photo10x8", label: 'Photo 10 × 8"', w: 254, h: 203.2 },
  { id: "card", label: "Business card (90 × 50)", w: 90, h: 50 },
  { id: "label", label: "Label (100 × 50)", w: 100, h: 50 },
];
