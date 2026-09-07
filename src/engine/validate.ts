import type { ImageAsset, Project } from "@/types/project";
import { effectiveDpi, qualityOf } from "./dpi";

export type CheckLevel = "ok" | "warn" | "error";

export interface PrintCheck {
  id: string;
  level: CheckLevel;
  message: string;
}

export function validateProject(
  project: Project,
  assets: Record<string, ImageAsset>,
): PrintCheck[] {
  const checks: PrintCheck[] = [];
  const doc = project.doc;

  checks.push({
    id: "paper",
    level: "ok",
    message: `Paper size: ${doc.paper} (${doc.width} × ${doc.height} mm)`,
  });
  checks.push({
    id: "orientation",
    level: "ok",
    message: `Orientation: ${doc.orientation}`,
  });

  let outside = 0;
  let lowDpi = 0;

  for (const page of project.pages) {
    for (const obj of page.objects) {
      if (!obj.visible) continue;
      const right = obj.x + obj.width;
      const bottom = obj.y + obj.height;
      if (obj.x < -0.5 || obj.y < -0.5 || right > doc.width + 0.5 || bottom > doc.height + 0.5) {
        outside++;
        checks.push({
          id: `out-${obj.id}`,
          level: "warn",
          message: `${obj.name} extends beyond the page.`,
        });
      }
      if (obj.type === "image" && obj.assetId) {
        const asset = assets[obj.assetId];
        if (asset) {
          const dpi = Math.min(
            effectiveDpi(asset.naturalWidth, obj.width),
            effectiveDpi(asset.naturalHeight, obj.height),
          );
          const q = qualityOf(dpi);
          if (q === "bad") {
            lowDpi++;
            checks.push({
              id: `dpi-${obj.id}`,
              level: "warn",
              message: `${obj.name} is only ${dpi} DPI.`,
            });
          } else if (q === "warn") {
            checks.push({
              id: `dpi-${obj.id}`,
              level: "warn",
              message: `${obj.name} is ${dpi} DPI (below 300 DPI).`,
            });
          }
        }
      }
    }
  }

  if (!outside) {
    checks.push({
      id: "bounds",
      level: "ok",
      message: "No objects outside printable area",
    });
  }
  if (!lowDpi) {
    checks.push({
      id: "dpi",
      level: "ok",
      message: "Image resolution acceptable",
    });
  }

  checks.push({
    id: "bleed",
    level: doc.bleed > 0 ? "ok" : "ok",
    message: doc.bleed > 0 ? `Bleed: ${doc.bleed} mm` : "Bleed: none",
  });
  checks.push({
    id: "crop",
    level: "ok",
    message: doc.cropMarks ? "Crop marks: on" : "Crop marks: off",
  });

  return checks;
}

export function hasBlockingIssues(checks: PrintCheck[]): boolean {
  return checks.some((c) => c.level === "error");
}

export function issueCount(checks: PrintCheck[]): number {
  return checks.filter((c) => c.level === "warn" || c.level === "error").length;
}
