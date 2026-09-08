import { useStudio } from "@/store/useStudio";
import { Button } from "@/components/ui/button";
import { fitRect } from "@/engine/layout";
import { BrandMark } from "./ui-chrome";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PX_PER_MM = 2.5;

export function PrintPreview({ onBack }: { onBack: () => void }) {
  const project = useStudio((s) => s.project);
  const assets = useStudio((s) => s.assets);
  const pageIndex = useStudio((s) => s.pageIndex);
  const setPageIndex = useStudio((s) => s.setPageIndex);
  const doc = project.doc;
  const page = project.pages[pageIndex];
  const scale = PX_PER_MM;
  const pageW = doc.width * scale;
  const pageH = doc.height * scale;
  const bleed = doc.bleed * scale;
  const mark = 8;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0b0a] text-foreground">
      <div className="flex items-center gap-3 border-b border-border/60 bg-panel/95 px-4 py-3 backdrop-blur-md">
        <BrandMark />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-tight">Print preview</p>
          <p className="truncate font-mono-nums text-[11px] text-muted-foreground">
            {doc.paper} · {doc.orientation} · {doc.width} × {doc.height} mm
          </p>
        </div>
        <Button variant="secondary" className="ml-2" onClick={onBack}>
          Back to editor
        </Button>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border/50 bg-surface/60 p-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            disabled={pageIndex <= 0}
            onClick={() => setPageIndex(pageIndex - 1)}
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <span className="font-mono-nums min-w-[4.5rem] text-center text-xs">
            {pageIndex + 1} / {project.pages.length}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            disabled={pageIndex >= project.pages.length - 1}
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
      <div className="canvas-atmosphere flex flex-1 items-center justify-center overflow-auto p-10">
        <div className="relative" style={{ padding: bleed + mark + 16 }}>
          {doc.cropMarks && (
            <>
              {(
                [
                  [0, 0, 1],
                  [1, 0, 1],
                  [0, 1, 1],
                  [1, 1, 1],
                  [0, 0, 0],
                  [1, 0, 0],
                  [0, 1, 0],
                  [1, 1, 0],
                ] as const
              ).map(([cx, cy, hx], i) => {
                const x = bleed + mark + 16 + cx * pageW;
                const y = bleed + mark + 16 + cy * pageH;
                return hx ? (
                  <div
                    key={i}
                    className="absolute h-px bg-slate-300"
                    style={{
                      left: x + (cx === 0 ? -mark - 4 : 4),
                      top: y,
                      width: mark,
                    }}
                  />
                ) : (
                  <div
                    key={i}
                    className="absolute w-px bg-slate-300"
                    style={{
                      left: x,
                      top: y + (cy === 0 ? -mark - 4 : 4),
                      height: mark,
                    }}
                  />
                );
              })}
            </>
          )}
          {bleed > 0 && (
            <div
              className="absolute border border-rose-500/40"
              style={{
                left: mark + 16,
                top: mark + 16,
                width: pageW + bleed * 2,
                height: pageH + bleed * 2,
              }}
            />
          )}
          <div
            className="relative bg-white shadow-page"
            style={{
              width: pageW,
              height: pageH,
              marginLeft: bleed + mark + 16,
              marginTop: bleed + mark + 16,
            }}
          >
            {(doc.margins.top || doc.margins.left || doc.margins.right || doc.margins.bottom) > 0 && (
              <div
                className="pointer-events-none absolute border border-dashed border-sky-400/50"
                style={{
                  left: doc.margins.left * scale,
                  top: doc.margins.top * scale,
                  width: (doc.width - doc.margins.left - doc.margins.right) * scale,
                  height: (doc.height - doc.margins.top - doc.margins.bottom) * scale,
                }}
              />
            )}
            {(page?.objects ?? []).map((obj) => {
              if (!obj.visible) return null;
              const asset = obj.assetId ? assets[obj.assetId] : undefined;
              const inner =
                asset && obj.fit !== "stretch"
                  ? fitRect(obj.width, obj.height, asset.naturalWidth, asset.naturalHeight, obj.fit)
                  : { w: obj.width, h: obj.height };
              return (
                <div
                  key={obj.id}
                  className="absolute overflow-hidden"
                  style={{
                    left: obj.x * scale,
                    top: obj.y * scale,
                    width: obj.width * scale,
                    height: obj.height * scale,
                    transform: `rotate(${obj.rotation}deg)`,
                  }}
                >
                  {asset ? (
                    <img
                      src={asset.src}
                      alt=""
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ width: inner.w * scale, height: inner.h * scale }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 font-display text-xs font-medium text-slate-500">
                      {obj.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
