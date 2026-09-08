import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useStudio } from "@/store/useStudio";
import { OBJECT_PRESETS, PAPER_SIZES, PHOTO_PRESETS, round2 } from "@/engine/units";
import { computeImposition } from "@/engine/layout";
import { effectiveDpi, qualityLabel, qualityOf } from "@/engine/dpi";
import { formatBytes } from "@/services/imageLoader";
import { cn } from "@/lib/utils";
import { PanelHeading } from "./ui-chrome";
import { PrintCheckPanel } from "./PrintCheckPanel";

const N_UP = [1, 2, 3, 4, 6, 8, 9, 12];

function NumField({
  label,
  value,
  onChange,
  step = 1,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={step}
        disabled={disabled}
        value={round2(value)}
        className="h-8 font-mono-nums text-xs"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function QuickSetup() {
  const quickTwoUpA4 = useStudio((s) => s.quickTwoUpA4);
  const autoArrange = useStudio((s) => s.autoArrange);
  const fillPageWithSize = useStudio((s) => s.fillPageWithSize);
  const catalogFromAssets = useStudio((s) => s.catalogFromAssets);
  const setDoc = useStudio((s) => s.setDoc);
  const doc = useStudio((s) => s.project.doc);
  const assets = useStudio((s) => s.assets);
  type Mode = "a4a3" | "photos" | "labels" | "cards" | "custom" | "catalog" | "blank";
  const [mode, setMode] = useState<Mode>("a4a3");
  const [nUp, setNUp] = useState("2");
  const [objW, setObjW] = useState(210);
  const [objH, setObjH] = useState(297);
  const [qty, setQty] = useState(2);
  const [bestFit, setBestFit] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const [photoId, setPhotoId] = useState("photo6x4");

  const preview = useMemo(
    () =>
      computeImposition({
        paperWidth: doc.width,
        paperHeight: doc.height,
        objectWidth: objW,
        objectHeight: objH,
        marginTop: doc.margins.top,
        marginRight: doc.margins.right,
        marginBottom: doc.margins.bottom,
        marginLeft: doc.margins.left,
        horizontalGap: doc.gutterH,
        verticalGap: doc.gutterV,
        allowRotation: bestFit,
        quantity: qty,
      }),
    [doc, objW, objH, qty, bestFit],
  );

  const applyModeDefaults = (m: Mode) => {
    setMode(m);
    if (m === "a4a3") {
      setObjW(210);
      setObjH(297);
      setNUp("2");
      setQty(2);
      setDoc({
        paper: "A3",
        orientation: "landscape",
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        gutterH: 0,
        gutterV: 0,
        bleed: 0,
        cropMarks: false,
      });
    } else if (m === "labels") {
      setObjW(100);
      setObjH(50);
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 5,
        gutterV: 5,
        bleed: 0,
        cropMarks: false,
      });
      setBestFit(true);
    } else if (m === "cards") {
      setObjW(90);
      setObjH(50);
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 3,
        gutterV: 3,
        bleed: 3,
        cropMarks: true,
      });
      setBestFit(true);
    } else if (m === "photos") {
      const p = PHOTO_PRESETS.find((x) => x.id === photoId) ?? PHOTO_PRESETS[0];
      setObjW(p.w);
      setObjH(p.h);
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 3,
        gutterV: 3,
        bleed: 0,
        cropMarks: false,
      });
      setBestFit(true);
    } else if (m === "catalog") {
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        gutterH: 0,
        gutterV: 0,
      });
    } else if (m === "blank") {
      setDoc({ paper: "A3", orientation: "landscape" });
    }
  };

  const runArrange = (fillPage: boolean) => {
    const ids = Object.keys(assets);
    if (mode === "catalog") {
      catalogFromAssets(ids);
      return;
    }
    if (mode === "a4a3") {
      setDoc({
        paper: "A3",
        orientation: "landscape",
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        gutterH: 0,
        gutterV: 0,
      });
    }
    if (fillPage) {
      fillPageWithSize(objW, objH, { allowRotation: bestFit, assetIds: ids });
    } else {
      autoArrange({
        objectWidth: objW,
        objectHeight: objH,
        quantity: qty,
        allowRotation: bestFit,
        assetIds: ids,
      });
    }
  };

  const intents: { id: Mode; title: string; hint: string }[] = [
    { id: "a4a3", title: "A4 on A3", hint: "2-up landscape" },
    { id: "photos", title: "Photos", hint: "6×4 and more" },
    { id: "labels", title: "Labels", hint: "Fill A4 sheet" },
    { id: "cards", title: "Cards", hint: "Bleed + crops" },
    { id: "catalog", title: "Catalog", hint: "One per page" },
    { id: "blank", title: "Blank", hint: "Empty A3" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading
          className="flex-1"
          action={
            <button
              type="button"
              className="cursor-pointer text-[10px] font-semibold text-primary hover:underline"
              onClick={() => setAdvanced((v) => !v)}
            >
              {advanced ? "Basic" : "Advanced"}
            </button>
          }
        >
          Quick setup
        </PanelHeading>
      </div>

      <Button
        className="cta-glow pressable w-full rounded-md font-bold"
        onClick={() => quickTwoUpA4()}
      >
        2 × A4 on A3
      </Button>

      <div className="grid grid-cols-2 gap-1.5">
        {intents.map((intent) => (
          <button
            key={intent.id}
            type="button"
            onClick={() => {
              applyModeDefaults(intent.id);
              if (intent.id === "a4a3") quickTwoUpA4();
              else if (intent.id === "catalog") catalogFromAssets(Object.keys(assets));
              else if (intent.id === "blank") {
                /* doc only */
              } else if (intent.id === "labels") {
                fillPageWithSize(100, 50, { allowRotation: true, assetIds: Object.keys(assets) });
              } else if (intent.id === "cards") {
                fillPageWithSize(90, 50, { allowRotation: true, assetIds: Object.keys(assets) });
              } else if (intent.id === "photos") {
                const p = PHOTO_PRESETS.find((x) => x.id === photoId) ?? PHOTO_PRESETS[0]!;
                fillPageWithSize(p.w, p.h, { allowRotation: true, assetIds: Object.keys(assets) });
              }
            }}
            className={cn(
              "pressable cursor-pointer rounded-lg border px-2 py-2 text-left transition-colors",
              mode === intent.id
                ? "border-primary/45 bg-primary/12 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_20%,transparent)]"
                : "border-border/60 bg-surface/40 hover:border-border hover:bg-surface-raised",
            )}
          >
            <p className="text-[11px] font-semibold tracking-tight">{intent.title}</p>
            <p className="text-[10px] text-muted-foreground">{intent.hint}</p>
          </button>
        ))}
      </div>

      {advanced && (
        <div className="space-y-3 border-t border-border/60 pt-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Mode</Label>
            <Select value={mode} onValueChange={(v) => applyModeDefaults(v as Mode)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4a3">A4 pages on A3</SelectItem>
                <SelectItem value="photos">Photos</SelectItem>
                <SelectItem value="labels">Labels</SelectItem>
                <SelectItem value="cards">Business cards</SelectItem>
                <SelectItem value="catalog">Catalog</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="blank">Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "photos" && (
            <Select
              value={photoId}
              onValueChange={(id) => {
                setPhotoId(id);
                const p = PHOTO_PRESETS.find((x) => x.id === id);
                if (p) {
                  setObjW(p.w);
                  setObjH(p.h);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHOTO_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {mode !== "catalog" && mode !== "blank" && (
            <div className="grid grid-cols-2 gap-2">
              <NumField label="Width (mm)" value={objW} onChange={setObjW} />
              <NumField label="Height (mm)" value={objH} onChange={setObjH} />
            </div>
          )}

          {mode !== "catalog" && mode !== "blank" && (
            <>
              <Select
                value={nUp}
                onValueChange={(v) => {
                  setNUp(v);
                  if (v !== "custom") setQty(Number(v));
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {N_UP.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}-up
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom quantity</SelectItem>
                </SelectContent>
              </Select>
              {nUp === "custom" && <NumField label="Quantity" value={qty} onChange={setQty} />}
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">Best fit (rotate)</Label>
                <Switch checked={bestFit} onCheckedChange={setBestFit} />
              </div>
              <div className="rounded-lg border border-border/70 bg-surface/60 px-2.5 py-2 text-[10px] text-muted-foreground">
                <p className="font-mono-nums text-foreground/85">
                  {preview.perPage} / page · {preview.pagesRequired} page(s)
                </p>
                <p className="mt-0.5 font-mono-nums">
                  Used {preview.usedPercent}% · Waste {preview.wastePercent}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full" variant="secondary" onClick={() => runArrange(false)}>
                  Auto arrange
                </Button>
                <Button className="w-full" variant="outline" onClick={() => runArrange(true)}>
                  Fill page
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DocumentSettings() {
  const doc = useStudio((s) => s.project.doc);
  const setDoc = useStudio((s) => s.setDoc);
  const showGrid = useStudio((s) => s.showGrid);
  const gridSize = useStudio((s) => s.gridSize);
  const snap = useStudio((s) => s.snap);
  const guides = useStudio((s) => s.guides);
  const showSafeArea = useStudio((s) => s.showSafeArea);
  const safeArea = useStudio((s) => s.safeArea);
  const showRulers = useStudio((s) => s.showRulers);
  const setState = useStudio((s) => s.set);

  const setMargin = (key: keyof typeof doc.margins, value: number) => {
    if (doc.marginsLocked) {
      setDoc({ margins: { top: value, right: value, bottom: value, left: value } });
    } else {
      setDoc({ margins: { ...doc.margins, [key]: value } });
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeading>Document</PanelHeading>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Paper</Label>
        <Select value={doc.paper} onValueChange={(paper) => setDoc({ paper })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAPER_SIZES.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Orientation</Label>
        <Select
          value={doc.orientation}
          onValueChange={(orientation) =>
            setDoc({ orientation: orientation as "portrait" | "landscape" })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {doc.paper === "Custom" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Width (mm)" value={doc.width} onChange={(width) => setDoc({ width })} />
          <NumField label="Height (mm)" value={doc.height} onChange={(height) => setDoc({ height })} />
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Trim: {doc.width} × {doc.height} mm
      </p>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Lock margins</Label>
        <Switch
          checked={doc.marginsLocked}
          onCheckedChange={(marginsLocked) => setDoc({ marginsLocked })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Top" value={doc.margins.top} onChange={(v) => setMargin("top", v)} />
        <NumField label="Right" value={doc.margins.right} onChange={(v) => setMargin("right", v)} />
        <NumField label="Bottom" value={doc.margins.bottom} onChange={(v) => setMargin("bottom", v)} />
        <NumField label="Left" value={doc.margins.left} onChange={(v) => setMargin("left", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Gap H" value={doc.gutterH} onChange={(gutterH) => setDoc({ gutterH })} />
        <NumField label="Gap V" value={doc.gutterV} onChange={(gutterV) => setDoc({ gutterV })} />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Bleed (mm)</Label>
        <Select
          value={String(doc.bleed)}
          onValueChange={(v) => setDoc({ bleed: Number(v) })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 5].map((b) => (
              <SelectItem key={b} value={String(b)}>
                {b} mm
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Crop marks</Label>
        <Switch checked={doc.cropMarks} onCheckedChange={(cropMarks) => setDoc({ cropMarks })} />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Background</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            className="h-8 w-12 p-1"
            value={doc.background === "transparent" ? "#ffffff" : doc.background}
            onChange={(e) => setDoc({ background: e.target.value })}
          />
          <Button size="sm" variant="outline" onClick={() => setDoc({ background: "#ffffff" })}>
            White
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDoc({ background: "transparent" })}>
            Clear
          </Button>
        </div>
      </div>

      <div className="h-px bg-border/60" />
      <PanelHeading>View & snap</PanelHeading>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Rulers</Label>
        <Switch checked={showRulers} onCheckedChange={(v) => setState({ showRulers: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Grid</Label>
        <Switch checked={showGrid} onCheckedChange={(v) => setState({ showGrid: v })} />
      </div>
      <Select value={String(gridSize)} onValueChange={(v) => setState({ gridSize: Number(v) })}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Grid size" />
        </SelectTrigger>
        <SelectContent>
          {[1, 5, 10, 25].map((g) => (
            <SelectItem key={g} value={String(g)}>
              {g} mm
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Safe area</Label>
        <Switch checked={showSafeArea} onCheckedChange={(v) => setState({ showSafeArea: v })} />
      </div>
      <NumField label="Safe area (mm)" value={safeArea} onChange={(v) => setState({ safeArea: v })} />
      {(
        [
          ["grid", "Snap to grid"],
          ["objects", "Snap to objects"],
          ["page", "Snap to page"],
          ["center", "Snap to centre"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            checked={snap[key]}
            onCheckedChange={(v) => setState({ snap: { ...snap, [key]: !!v } })}
            id={`snap-${key}`}
          />
          <Label htmlFor={`snap-${key}`} className="text-xs">
            {label}
          </Label>
        </div>
      ))}
      <NumField
        label="Snap distance (mm)"
        value={snap.distance}
        onChange={(distance) => setState({ snap: { ...snap, distance } })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setState({ guides: { ...guides, v: [...guides.v, round2(doc.width / 2)] } })
          }
        >
          + V guide
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setState({ guides: { ...guides, h: [...guides.h, round2(doc.height / 2)] } })
          }
        >
          + H guide
        </Button>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setState({ guides: { v: [], h: [] } })}>
        Clear guides
      </Button>
    </div>
  );
}

function PrintProfilesPanel() {
  const profiles = useStudio((s) => s.printProfiles);
  const savePrintProfile = useStudio((s) => s.savePrintProfile);
  const applyPrintProfile = useStudio((s) => s.applyPrintProfile);
  const deletePrintProfile = useStudio((s) => s.deletePrintProfile);
  const [name, setName] = useState("");

  return (
    <div className="space-y-3">
      <PanelHeading>Print profiles</PanelHeading>
      <div className="flex gap-2">
        <Input
          placeholder="Profile name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            savePrintProfile(name.trim() || "My printer");
            setName("");
          }}
        >
          Save
        </Button>
      </div>
      <div className="space-y-1.5">
        {profiles.length === 0 && (
          <p className="text-[10px] text-muted-foreground">
            Save paper, margins, bleed, and crop marks as a reusable printer profile.
          </p>
        )}
        {profiles.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface/60 px-2 py-1.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{p.name}</p>
              <p className="font-mono-nums text-[10px] text-muted-foreground">
                {p.paper} · bleed {p.bleed} · crop {p.cropMarks ? "on" : "off"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => applyPrintProfile(p)}>
                Apply
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => deletePrintProfile(p.id)}>
                Del
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectProperties() {
  const selectedIds = useStudio((s) => s.selectedIds);
  const project = useStudio((s) => s.project);
  const pageIndex = useStudio((s) => s.pageIndex);
  const assets = useStudio((s) => s.assets);
  const updateObject = useStudio((s) => s.updateObject);
  const align = useStudio((s) => s.align);
  const [lockAspect, setLockAspect] = useState(true);

  const obj = project.pages[pageIndex]?.objects.find((o) => o.id === selectedIds[0]);
  if (!obj || selectedIds.length !== 1) {
    return (
      <div className="space-y-2">
        <PanelHeading>Selection</PanelHeading>
        <p className="text-xs text-muted-foreground">
          {selectedIds.length > 1
            ? `${selectedIds.length} objects selected`
            : "Select an object to edit properties"}
        </p>
        {selectedIds.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {["left", "center", "right", "top", "middle", "bottom"].map((m) => (
              <Button key={m} size="sm" variant="outline" className="text-[10px]" onClick={() => align(m)}>
                {m}
              </Button>
            ))}
            <Button size="sm" variant="outline" className="col-span-3 text-[10px]" onClick={() => align("distribute-h")}>
              Distribute H
            </Button>
            <Button size="sm" variant="outline" className="col-span-3 text-[10px]" onClick={() => align("distribute-v")}>
              Distribute V
            </Button>
          </div>
        )}
      </div>
    );
  }

  const asset = obj.assetId ? assets[obj.assetId] : undefined;
  const dpi = asset
    ? Math.min(
        effectiveDpi(asset.naturalWidth, obj.width),
        effectiveDpi(asset.naturalHeight, obj.height),
      )
    : 0;
  const quality = qualityOf(dpi);

  const setSize = (width: number, height: number) => {
    if (lockAspect && obj.width > 0) {
      const ratio = obj.width / obj.height;
      if (Math.abs(width - obj.width) >= Math.abs(height - obj.height)) {
        updateObject(obj.id, { width, height: width / ratio });
      } else {
        updateObject(obj.id, { height, width: height * ratio });
      }
    } else {
      updateObject(obj.id, { width, height });
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeading>Object</PanelHeading>
      <Input
        value={obj.name}
        className="h-8 text-xs"
        onChange={(e) => updateObject(obj.id, { name: e.target.value }, false)}
        onBlur={(e) => updateObject(obj.id, { name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumField label="X (mm)" value={obj.x} onChange={(x) => updateObject(obj.id, { x })} step={0.1} />
        <NumField label="Y (mm)" value={obj.y} onChange={(y) => updateObject(obj.id, { y })} step={0.1} />
        <NumField
          label="Width"
          value={obj.width}
          onChange={(w) => setSize(w, obj.height)}
          step={0.1}
          disabled={obj.locked}
        />
        <NumField
          label="Height"
          value={obj.height}
          onChange={(h) => setSize(obj.width, h)}
          step={0.1}
          disabled={obj.locked}
        />
        <NumField
          label="Rotation"
          value={obj.rotation}
          onChange={(rotation) => updateObject(obj.id, { rotation })}
          disabled={obj.locked}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Lock aspect ratio</Label>
        <Switch checked={lockAspect} onCheckedChange={setLockAspect} />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Preset size</Label>
        <Select
          onValueChange={(id) => {
            const p = OBJECT_PRESETS.find((x) => x.id === id);
            if (p) updateObject(obj.id, { width: p.w, height: p.h });
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Set size…" />
          </SelectTrigger>
          <SelectContent>
            {OBJECT_PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Fit</Label>
        <Select
          value={obj.fit}
          onValueChange={(fit) => updateObject(obj.id, { fit: fit as typeof obj.fit })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fit">Fit</SelectItem>
            <SelectItem value="fill">Fill / Crop</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {obj.type === "text" && (
        <div className="space-y-2 rounded-lg border border-border/70 bg-surface/50 p-2">
          <Label className="text-[10px] text-muted-foreground">Text</Label>
          <Input
            value={obj.text ?? ""}
            className="h-8 text-xs"
            onChange={(e) => updateObject(obj.id, { text: e.target.value }, false)}
            onBlur={(e) => updateObject(obj.id, { text: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumField
              label="Size (pt)"
              value={obj.fontSize ?? 12}
              onChange={(fontSize) => updateObject(obj.id, { fontSize })}
            />
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Colour</Label>
              <Input
                type="color"
                className="h-8 w-full p-1"
                value={obj.color ?? "#111111"}
                onChange={(e) => updateObject(obj.id, { color: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Checkbox
                checked={!!obj.bold}
                onCheckedChange={(v) => updateObject(obj.id, { bold: !!v })}
                id="bold"
              />
              <Label htmlFor="bold" className="text-xs">
                Bold
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox
                checked={!!obj.italic}
                onCheckedChange={(v) => updateObject(obj.id, { italic: !!v })}
                id="italic"
              />
              <Label htmlFor="italic" className="text-xs">
                Italic
              </Label>
            </div>
          </div>
          <Select
            value={obj.align ?? "left"}
            onValueChange={(align) =>
              updateObject(obj.id, { align: align as "left" | "center" | "right" })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Align" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(obj.type === "rect" || obj.type === "circle" || obj.type === "line") && (
        <div className="space-y-2 rounded-lg border border-border/70 bg-surface/50 p-2">
          <Label className="text-[10px] text-muted-foreground">Shape</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Stroke</Label>
              <Input
                type="color"
                className="h-8 w-full p-1"
                value={obj.color ?? "#111111"}
                onChange={(e) => updateObject(obj.id, { color: e.target.value })}
              />
            </div>
            <NumField
              label="Stroke (pt)"
              value={obj.strokeWidth ?? 0.75}
              onChange={(strokeWidth) => updateObject(obj.id, { strokeWidth })}
              step={0.25}
            />
          </div>
          {obj.type !== "line" && (
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Fill</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="h-8 w-12 p-1"
                  value={obj.fill && obj.fill !== "none" ? obj.fill : "#ffffff"}
                  onChange={(e) => updateObject(obj.id, { fill: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px]"
                  onClick={() => updateObject(obj.id, { fill: "none" })}
                >
                  None
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        {["left", "center", "right", "top", "middle", "bottom"].map((m) => (
          <Button key={m} size="sm" variant="outline" className="text-[10px]" onClick={() => align(m)}>
            {m}
          </Button>
        ))}
      </div>
      {asset && (
        <div className="space-y-1.5 rounded-xl border border-border/70 bg-surface/80 p-3 text-[11px]">
          <p className="font-display text-xs font-medium tracking-tight">Image information</p>
          <p className="truncate text-muted-foreground">{asset.name}</p>
          <p className="font-mono-nums">
            Original: {asset.naturalWidth} × {asset.naturalHeight} px
          </p>
          <p className="font-mono-nums">File: {formatBytes(asset.fileSize)}</p>
          <p className="font-mono-nums">
            Aspect: {(asset.naturalWidth / Math.max(1, asset.naturalHeight)).toFixed(3)}
          </p>
          <p className="font-mono-nums">
            Print: {round2(obj.width)} × {round2(obj.height)} mm
          </p>
          <p
            className={cn(
              "font-mono-nums",
              quality === "good" && "text-success",
              quality === "warn" && "text-warning",
              quality === "bad" && "text-destructive",
            )}
          >
            Effective DPI: {dpi} — {qualityLabel[quality]}
          </p>
          {quality === "bad" && (
            <p className="text-warning">Image may appear pixelated when printed.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function RightSidebar() {
  return (
    <aside className="flex w-[18rem] shrink-0 flex-col border-l border-border/70 bg-panel text-panel-foreground">
      <ScrollArea className="flex-1">
        <div className="studio-stagger space-y-3 p-2.5">
          <PrintCheckPanel />
          <div className="panel-section space-y-3 p-3">
            <QuickSetup />
          </div>
          <div className="panel-section space-y-3 p-3">
            <DocumentSettings />
          </div>
          <div className="panel-section space-y-3 p-3">
            <PrintProfilesPanel />
          </div>
          <div className="panel-section space-y-3 p-3">
            <ObjectProperties />
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
