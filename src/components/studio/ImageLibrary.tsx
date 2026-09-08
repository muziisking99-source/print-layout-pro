import { useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { toast } from "sonner";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio } from "@/store/useStudio";
import { formatBytes, loadImageFiles } from "@/services/imageLoader";
import { effectiveDpi, qualityOf } from "@/engine/dpi";
import type { ImageAsset } from "@/types/project";
import { cn } from "@/lib/utils";
import { EmptyState, PanelHeading } from "./ui-chrome";

type SortKey = "name" | "size" | "pixels";
type FilterKey = "all" | "unused" | "lowdpi";

function usedAssetIds(project: ReturnType<typeof useStudio.getState>["project"]): Set<string> {
  const ids = new Set<string>();
  for (const page of project.pages) {
    for (const obj of page.objects) {
      if (obj.assetId) ids.add(obj.assetId);
    }
  }
  return ids;
}

function assetDpi(asset: ImageAsset, project: ReturnType<typeof useStudio.getState>["project"]): number {
  let min = Infinity;
  let found = false;
  for (const page of project.pages) {
    for (const obj of page.objects) {
      if (obj.assetId !== asset.id) continue;
      found = true;
      const dpi = Math.min(
        effectiveDpi(asset.naturalWidth, obj.width),
        effectiveDpi(asset.naturalHeight, obj.height),
      );
      min = Math.min(min, dpi);
    }
  }
  if (!found) {
    return Math.min(effectiveDpi(asset.naturalWidth, 100), effectiveDpi(asset.naturalHeight, 100));
  }
  return min === Infinity ? 0 : min;
}

export function ImageLibrary() {
  const assets = useStudio((s) => s.assets);
  const project = useStudio((s) => s.project);
  const selectedIds = useStudio((s) => s.selectedIds);
  const addAssets = useStudio((s) => s.addAssets);
  const removeAsset = useStudio((s) => s.removeAsset);
  const placeAsset = useStudio((s) => s.placeAsset);
  const placeOnEmptySlots = useStudio((s) => s.placeOnEmptySlots);
  const replaceSelectedWithAsset = useStudio((s) => s.replaceSelectedWithAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const list = useMemo(() => {
    const used = usedAssetIds(project);
    let rows = Object.values(assets);
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((a) => a.name.toLowerCase().includes(q));
    if (filter === "unused") rows = rows.filter((a) => !used.has(a.id));
    if (filter === "lowdpi") {
      rows = rows.filter((a) => {
        const qLevel = qualityOf(assetDpi(a, project));
        return qLevel === "bad" || qLevel === "warn";
      });
    }
    rows = [...rows].sort((a, b) => {
      if (sort === "size") return b.fileSize - a.fileSize;
      if (sort === "pixels") return b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [assets, project, query, sort, filter]);

  const importFiles = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    const { assets: loaded, errors } = await loadImageFiles(files);
    if (loaded.length) {
      addAssets(loaded);
      toast.success(`Added ${loaded.length} image${loaded.length === 1 ? "" : "s"}`);
    }
    for (const err of errors) toast.error(`${err.name}: ${err.message}`);
  };

  const toggleSelect = (id: string, multi: boolean) => {
    setSelected((prev) => {
      if (!multi) return prev.includes(id) && prev.length === 1 ? [] : [id];
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const selectAllVisible = () => setSelected(list.map((a) => a.id));
  const clearSelection = () => setSelected([]);

  const bulkDelete = () => {
    if (!selected.length) return;
    for (const id of selected) removeAsset(id);
    toast.success(`Removed ${selected.length} image${selected.length === 1 ? "" : "s"}`);
    clearSelection();
  };

  const placeSelected = () => {
    if (!selected.length) return;
    placeOnEmptySlots(selected);
    toast.success(`Placed ${selected.length} image${selected.length === 1 ? "" : "s"}`);
  };

  const replaceWithFirst = () => {
    const id = selected[0];
    if (!id) return;
    if (!selectedIds.length) {
      toast.error("Select object(s) on the page first");
      return;
    }
    replaceSelectedWithAsset(id);
    toast.success("Replaced selected object(s)");
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading>Library</PanelHeading>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="pressable h-7 rounded-md px-2.5 text-[11px]"
            onClick={() => inputRef.current?.click()}
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="pressable h-7 rounded-md px-2.5 text-[11px]"
            onClick={() => folderRef.current?.click()}
          >
            Folder
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/tiff,.jpg,.jpeg,.png,.webp,.svg,.tif,.tiff"
          multiple
          className="hidden"
          onChange={(e) => {
            void importFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={folderRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            void importFiles(e.target.files);
            e.target.value = "";
          }}
          {...({ webkitdirectory: "", directory: "" } as InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>

      <div
        className="rounded-xl border border-dashed border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-primary)_6%,transparent),transparent)] px-3 py-5 text-center transition-colors duration-200 hover:border-primary/40 hover:bg-primary/[0.06]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void importFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-[11px] font-medium text-foreground/85">Drop images</p>
        <p className="mt-1 text-[10px] text-muted-foreground">JPG, PNG, WEBP, SVG</p>
      </div>

      <div className="space-y-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search filename…"
          className="h-8 text-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: name</SelectItem>
              <SelectItem value="size">Sort: file size</SelectItem>
              <SelectItem value="pixels">Sort: pixels</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All images</SelectItem>
              <SelectItem value="unused">Unused in doc</SelectItem>
              <SelectItem value="lowdpi">Low DPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {list.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={selectAllVisible}>
              Select all
            </Button>
            {selected.length > 0 && (
              <>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={clearSelection}>
                  Clear
                </Button>
                <Button size="sm" variant="secondary" className="h-7 px-2 text-[10px]" onClick={placeSelected}>
                  Place on slots
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={replaceWithFirst}>
                  Replace selection
                </Button>
                <Button size="sm" variant="destructive" className="h-7 px-2 text-[10px]" onClick={bulkDelete}>
                  Delete ({selected.length})
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="studio-stagger flex flex-col gap-1.5 pr-2">
          {list.length === 0 && (
            <EmptyState
              icon={<ImageIcon className="size-4" strokeWidth={1.5} />}
              title={Object.keys(assets).length ? "No matches" : "No images yet"}
              hint={
                Object.keys(assets).length
                  ? "Try another search or filter."
                  : "Add files, then drag them onto the page or into a slot."
              }
            />
          )}
          {list.map((asset) => {
            const isSelected = selected.includes(asset.id);
            const dpi = assetDpi(asset, project);
            const q = qualityOf(dpi);
            return (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-pls-asset", asset.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={(e) => toggleSelect(asset.id, e.metaKey || e.ctrlKey || e.shiftKey)}
                onDoubleClick={() => placeAsset(asset.id)}
                className={cn(
                  "group pressable flex cursor-grab items-center gap-2.5 rounded-xl border bg-surface/50 p-2 transition-colors hover:bg-surface-raised active:cursor-grabbing",
                  isSelected ? "border-primary/50 bg-primary/[0.1] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_15%,transparent)]" : "border-transparent hover:border-border",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(asset.id, true)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                  {asset.src ? (
                    <img src={asset.src} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium tracking-tight">{asset.name}</p>
                  <p className="font-mono-nums text-[10px] text-muted-foreground">
                    {asset.naturalWidth}×{asset.naturalHeight} · {formatBytes(asset.fileSize)}
                    {(q === "warn" || q === "bad") && (
                      <span className={cn("ml-1", q === "bad" ? "text-destructive" : "text-warning")}>
                        · {dpi} DPI
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAsset(asset.id);
                    setSelected((prev) => prev.filter((x) => x !== asset.id));
                  }}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
