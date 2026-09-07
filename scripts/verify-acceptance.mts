import { orientedSize, mmToPt } from "../src/engine/units";
import { computeImposition } from "../src/engine/layout";
import { PDFDocument } from "pdf-lib";
import { buildPdf } from "../src/engine/pdfEngine";
import type { Project } from "../src/types/project";

async function main() {
  const size = orientedSize("A3", "landscape");
  console.log("A3 landscape mm:", size);
  if (size.width !== 420 || size.height !== 297) throw new Error("paper size");

  const result = computeImposition({
    paperWidth: 420,
    paperHeight: 297,
    objectWidth: 210,
    objectHeight: 297,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    horizontalGap: 0,
    verticalGap: 0,
    allowRotation: false,
    quantity: 2,
  });
  console.log("imposition:", {
    cols: result.columns,
    rows: result.rows,
    perPage: result.perPage,
    positions: result.positions,
  });
  if (result.perPage !== 2) throw new Error("expected 2-up");
  const a = result.positions[0]!;
  const b = result.positions[1]!;
  if (a.x !== 0 || a.width !== 210 || a.height !== 297) throw new Error("slot 1");
  if (b.x !== 210 || b.y !== 0 || b.width !== 210 || b.height !== 297) throw new Error("slot 2");

  const project: Project = {
    name: "Test",
    doc: {
      paper: "A3",
      width: 420,
      height: 297,
      orientation: "landscape",
      unit: "mm",
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      marginsLocked: true,
      bleed: 0,
      gutterH: 0,
      gutterV: 0,
      cropMarks: false,
      background: "#ffffff",
    },
    pages: [
      {
        id: "p1",
        objects: [
          {
            id: "o1",
            type: "rect",
            name: "A4-1",
            x: 0,
            y: 0,
            width: 210,
            height: 297,
            rotation: 0,
            locked: false,
            visible: true,
            fit: "fit",
          },
          {
            id: "o2",
            type: "rect",
            name: "A4-2",
            x: 210,
            y: 0,
            width: 210,
            height: 297,
            rotation: 0,
            locked: false,
            visible: true,
            fit: "fit",
          },
        ],
      },
    ],
  };

  const bytes = await buildPdf(project, {}, {
    filename: "test",
    quality: "high",
    includeBleed: false,
    cropMarks: false,
    includeBackground: true,
  });
  const pdf = await PDFDocument.load(bytes);
  const page = pdf.getPage(0);
  const { width, height } = page.getSize();
  console.log("buildPdf page pt:", width, height);
  console.log("buildPdf page mm:", width / (72 / 25.4), height / (72 / 25.4));
  if (Math.abs(width - mmToPt(420)) > 0.05 || Math.abs(height - mmToPt(297)) > 0.05) {
    throw new Error("buildPdf page size");
  }

  console.log("Image slots: 210x297 at (0,0) and (210,0)");
  console.log("ACCEPTANCE CHECKS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
