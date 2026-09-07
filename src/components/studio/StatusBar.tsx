import { ChevronLeft, ChevronRight, Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/store/useStudio";
import { effectiveDpi, qualityOf } from "@/engine/dpi";
import { round2 } from "@/engine/units";
import { cn } from "@/lib/utils";

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2];

export function StatusBar() {
  const project = useStudio((s) => s.project);
  const pageIndex = useStudio((s) => s.pageIndex);
  const zoom = useStudio((s) => s.zoom);
  const selectedIds = useStudio((s) => s.selectedIds);
  const assets = useStudio((s) => s.assets);
  const setState = useStudio((s) => s.set);
  const setPageIndex = useStudio((s) => s.setPageIndex);
  const addPage = useStudio((s) => s.addPage);
  const duplicatePage = useStudio((s) => s.duplicatePage);
  const deletePage = useStudio((s) => s.deletePage);
  const doc = project.doc;
  const page = project.pages[pageIndex];
  const obj = page?.objects.find((o) => o.id === selectedIds[0]);
  const asset = obj?.assetId ? assets[obj.assetId] : undefined;
  const dpi =
    asset && obj
      ? Math.min(
          effectiveDpi(asset.naturalWidth, obj.width),
          effectiveDpi(asset.naturalHeight, obj.height),
        )
      : null;
  const q = dpi != null ? qualityOf(dpi) : null;

  return (
    <footer className="glass-panel flex h-11 shrink-0 items-center gap-3 border-t border-border/80 bg-panel/95 px-3 text-[11px] text-muted-foreground backdrop-blur-md">
      <div className="flex items-center gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="pressable size-7 rounded-md"
          disabled={pageIndex <= 0}
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.75} />
        </Button>
        <span className="font-mono-nums min-w-[5.75rem] text-center text-foreground/90">
          {pageIndex + 1} / {project.pages.length}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="pressable size-7 rounded-md"
          disabled={pageIndex >= project.pages.length - 1}
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          <ChevronRight className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button size="sm" variant="ghost" className="pressable h-7 rounded-md px-2 text-[11px]" onClick={addPage}>
          + Page
        </Button>
        <Button size="sm" variant="ghost" className="pressable h-7 rounded-md px-2 text-[11px]" onClick={duplicatePage}>
          Dup
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="pressable h-7 rounded-md px-2 text-[11px]"
          disabled={project.pages.length <= 1}
          onClick={deletePage}
        >
          Del
        </Button>
      </div>

      <span className="hidden h-4 w-px bg-border/80 sm:block" />

      <span className="hidden font-display tracking-tight text-foreground/80 sm:inline">
        {doc.paper} · {doc.orientation}
      </span>
      <span className="hidden font-mono-nums md:inline">
        {doc.width} × {doc.height} mm
      </span>
      <span className="font-mono-nums">obj {page?.objects.length ?? 0}</span>

      {obj && selectedIds.length === 1 && (
        <span className="hidden font-mono-nums text-foreground/85 xl:inline">
          x{round2(obj.x)} y{round2(obj.y)} w{round2(obj.width)} h{round2(obj.height)}
          {dpi != null && (
            <span
              className={cn(
                "ml-2",
                q === "good" && "text-emerald-400/90",
                q === "warn" && "text-amber-300/90",
                q === "bad" && "text-rose-400/90",
              )}
            >
              {dpi} dpi
            </span>
          )}
        </span>
      )}

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="pressable size-7 rounded-md"
          onClick={() => setState({ zoom: Math.max(0.05, zoom / 1.2) })}
        >
          <Minus className="size-3.5" strokeWidth={1.75} />
        </Button>
        {ZOOM_PRESETS.map((z) => (
          <button
            key={z}
            type="button"
            className={cn(
              "pressable rounded-md px-1.5 py-1 font-mono-nums text-[10px] hover:bg-surface-raised hover:text-foreground",
              Math.abs(zoom - z) < 0.02 && "bg-primary/15 text-primary",
            )}
            onClick={() => setState({ zoom: z })}
          >
            {Math.round(z * 100)}%
          </button>
        ))}
        <Button
          size="icon"
          variant="ghost"
          className="pressable size-7 rounded-md"
          onClick={() => setState({ zoom: Math.min(4, zoom * 1.2) })}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="pressable h-7 gap-1 rounded-md px-2 text-[11px]"
          onClick={() => setState({ fitRequest: useStudio.getState().fitRequest + 1 })}
        >
          <Maximize2 className="size-3.5" strokeWidth={1.75} /> Fit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="pressable h-7 rounded-md px-2 text-[11px]"
          onClick={() => setState({ zoom: 1 })}
        >
          100%
        </Button>
      </div>
    </footer>
  );
}
