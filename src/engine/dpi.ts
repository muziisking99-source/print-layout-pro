import { MM_PER_IN } from "./units";

export type QualityLevel = "good" | "warn" | "bad" | "unknown";

export const DPI_THRESHOLDS = { good: 300, warn: 150 };

export function effectiveDpi(pixels: number, mm: number): number {
  if (!mm || !pixels) return 0;
  return Math.round(pixels / (mm / MM_PER_IN));
}

export function qualityOf(dpi: number): QualityLevel {
  if (!dpi) return "unknown";
  if (dpi >= DPI_THRESHOLDS.good) return "good";
  if (dpi >= DPI_THRESHOLDS.warn) return "warn";
  return "bad";
}

export const qualityLabel: Record<QualityLevel, string> = {
  good: "Print quality acceptable",
  warn: "Usable, but below 300 DPI",
  bad: "May look pixelated when printed",
  unknown: "Unknown",
};
