import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { ImageAsset, Project } from "@/types/project";
import { mmToPt } from "./units";
import { fitRect } from "./layout";

export interface ExportOptions {
  filename: string;
  quality: "standard" | "high" | "maximum";
  includeBleed: boolean;
  cropMarks: boolean;
  includeBackground: boolean;
}

const CROP_MARK_LENGTH = 5; // mm
const CROP_MARK_OFFSET = 2; // mm
const CROP_MARK_WIDTH = 0.25; // pt

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return rgb(1, 1, 1);
  return rgb(
    parseInt(m[1]!, 16) / 255,
    parseInt(m[2]!, 16) / 255,
    parseInt(m[3]!, 16) / 255,
  );
}

async function dataUrlToBytes(src: string): Promise<{ bytes: Uint8Array; kind: "jpg" | "png" }> {
  const isJpeg = src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg");
  const isPng = src.startsWith("data:image/png");
  if (isJpeg || isPng) {
    const res = await fetch(src);
    const buf = await res.arrayBuffer();
    return { bytes: new Uint8Array(buf), kind: isJpeg ? "jpg" : "png" };
  }
  // Convert unsupported formats (webp/svg/tiff-as-blob) to PNG at full resolution.
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 1000;
  canvas.height = img.naturalHeight || 1000;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const png = canvas.toDataURL("image/png");
  const res = await fetch(png);
  return { bytes: new Uint8Array(await res.arrayBuffer()), kind: "png" };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export async function buildPdf(
  project: Project,
  assets: Record<string, ImageAsset>,
  opts: ExportOptions,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(project.name);
  pdf.setProducer("Print Layout Studio");
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const bleed = opts.includeBleed ? project.doc.bleed : 0;
  const markRoom = opts.cropMarks ? CROP_MARK_OFFSET + CROP_MARK_LENGTH : 0;
  const extra = bleed + markRoom;

  const trimW = project.doc.width;
  const trimH = project.doc.height;
  const pageW = trimW + extra * 2;
  const pageH = trimH + extra * 2;

  const embedded = new Map<string, Awaited<ReturnType<typeof pdf.embedPng>>>();

  for (const page of project.pages) {
    const p = pdf.addPage([mmToPt(pageW), mmToPt(pageH)]);

    if (opts.includeBackground && project.doc.background !== "transparent") {
      p.drawRectangle({
        x: 0,
        y: 0,
        width: mmToPt(pageW),
        height: mmToPt(pageH),
        color: hexToRgb(project.doc.background || "#ffffff"),
      });
    }

    for (const obj of page.objects) {
      if (!obj.visible) continue;

      // convert page-space (top-left origin, mm) to PDF space (bottom-left origin, pt)
      const drawObject = async () => {
        let dw = obj.width;
        let dh = obj.height;
        let ox = obj.x;
        let oy = obj.y;

        if (obj.type === "image" && obj.assetId) {
          const asset = assets[obj.assetId];
          if (!asset) return;
          const key = asset.id;
          if (!embedded.has(key)) {
            const { bytes, kind } = await dataUrlToBytes(asset.src);
            embedded.set(
              key,
              kind === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes),
            );
          }
          const img = embedded.get(key)!;
          const r = fitRect(
            obj.width,
            obj.height,
            asset.naturalWidth,
            asset.naturalHeight,
            obj.fit === "fill" ? "fill" : obj.fit,
          );
          dw = r.w;
          dh = r.h;
          ox = obj.x + (obj.width - dw) / 2;
          oy = obj.y + (obj.height - dh) / 2;

          const cx = extra + ox + dw / 2;
          const cy = pageH - (extra + oy + dh / 2);
          const theta = (-obj.rotation * Math.PI) / 180;
          const vx = -dw / 2;
          const vy = -dh / 2;
          const ax = cx + (vx * Math.cos(theta) - vy * Math.sin(theta));
          const ay = cy + (vx * Math.sin(theta) + vy * Math.cos(theta));

          p.drawImage(img, {
            x: mmToPt(ax),
            y: mmToPt(ay),
            width: mmToPt(dw),
            height: mmToPt(dh),
            rotate: degrees(-obj.rotation),
          });
        } else if (obj.type === "text") {
          const size = obj.fontSize ?? 12;
          p.drawText(obj.text ?? "", {
            x: mmToPt(extra + obj.x),
            y: mmToPt(pageH - extra - obj.y - obj.height) + mmToPt(obj.height) - size,
            size,
            font,
            color: hexToRgb(obj.color ?? "#111111"),
          });
        } else if (obj.type === "rect") {
          p.drawRectangle({
            x: mmToPt(extra + obj.x),
            y: mmToPt(pageH - extra - obj.y - obj.height),
            width: mmToPt(obj.width),
            height: mmToPt(obj.height),
            borderColor: hexToRgb(obj.color ?? "#111111"),
            borderWidth: 0.75,
          });
        }
      };

      await drawObject();
    }

    if (opts.cropMarks) {
      const black = rgb(0, 0, 0);
      const L = mmToPt(CROP_MARK_LENGTH);
      const O = mmToPt(CROP_MARK_OFFSET + bleed);
      const left = mmToPt(extra);
      const right = mmToPt(extra + trimW);
      const bottom = mmToPt(extra);
      const top = mmToPt(extra + trimH);
      const line = (x1: number, y1: number, x2: number, y2: number) =>
        p.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness: CROP_MARK_WIDTH,
          color: black,
        });
      // horizontal marks
      line(left - O - L, top, left - O, top);
      line(right + O, top, right + O + L, top);
      line(left - O - L, bottom, left - O, bottom);
      line(right + O, bottom, right + O + L, bottom);
      // vertical marks
      line(left, top + O, left, top + O + L);
      line(right, top + O, right, top + O + L);
      line(left, bottom - O - L, left, bottom - O);
      line(right, bottom - O - L, right, bottom - O);
    }
  }

  return await pdf.save();
}

export function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Raster export of the layout (previews / sharing only). */
export async function exportRaster(
  project: Project,
  assets: Record<string, ImageAsset>,
  pageIndex: number,
  format: "png" | "jpeg",
  dpi = 150,
): Promise<Blob> {
  const pxPerMm = dpi / 25.4;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(project.doc.width * pxPerMm);
  canvas.height = Math.round(project.doc.height * pxPerMm);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle =
    project.doc.background === "transparent" ? "rgba(0,0,0,0)" : project.doc.background;
  if (format === "jpeg" || project.doc.background !== "transparent") {
    ctx.fillStyle = project.doc.background === "transparent" ? "#ffffff" : project.doc.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const page = project.pages[pageIndex];
  if (page) {
    for (const obj of page.objects) {
      if (!obj.visible || obj.type !== "image" || !obj.assetId) continue;
      const asset = assets[obj.assetId];
      if (!asset) continue;
      const img = await loadImage(asset.src);
      const r = fitRect(obj.width, obj.height, asset.naturalWidth, asset.naturalHeight, obj.fit);
      const dw = r.w * pxPerMm;
      const dh = r.h * pxPerMm;
      const cx = (obj.x + obj.width / 2) * pxPerMm;
      const cy = (obj.y + obj.height / 2) * pxPerMm;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }
  }
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), format === "png" ? "image/png" : "image/jpeg", 0.92),
  );
}
