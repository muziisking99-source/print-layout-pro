import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStudio } from "@/store/useStudio";
import type { PlacedObject } from "@/types/project";
import { fitRect } from "@/engine/layout";
import { cn } from "@/lib/utils";

const PX_PER_MM = 96 / 25.4;
const RULER = 20;

type DragMode =
  | { kind: "move"; ids: string[]; startX: number; startY: number; origins: Record<string, { x: number; y: number }> }
  | { kind: "resize"; id: string; handle: string; startX: number; startY: number; origin: PlacedObject }
  | { kind: "rotate"; id: string; cx: number; cy: number }
  | { kind: "pan"; startX: number; startY: number; scrollLeft: number; scrollTop: number };

export function CanvasStage() {
  const project = useStudio((s) => s.project);
  const assets = useStudio((s) => s.assets);
  const pageIndex = useStudio((s) => s.pageIndex);
  const zoom = useStudio((s) => s.zoom);
  const selectedIds = useStudio((s) => s.selectedIds);
  const showGrid = useStudio((s) => s.showGrid);
  const gridSize = useStudio((s) => s.gridSize);
  const showRulers = useStudio((s) => s.showRulers);
  const snap = useStudio((s) => s.snap);
  const guides = useStudio((s) => s.guides);
  const showSafeArea = useStudio((s) => s.showSafeArea);
  const safeArea = useStudio((s) => s.safeArea);
  const fitRequest = useStudio((s) => s.fitRequest);
  const setState = useStudio((s) => s.set);
  const updateObject = useStudio((s) => s.updateObject);
  const placeAsset = useStudio((s) => s.placeAsset);
  const assignAssetToObject = useStudio((s) => s.assignAssetToObject);
  const mutate = useStudio((s) => s.mutate);

  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode | null>(null);
  const [snapLines, setSnapLines] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  const doc = project.doc;
  const page = project.pages[pageIndex];
  const scale = zoom * PX_PER_MM;
  const pageW = doc.width * scale;
  const pageH = doc.height * scale;
  const bleed = doc.bleed * scale;

  const fitToScreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const pad = 80;
    const z = Math.min(
      (el.clientWidth - pad) / (doc.width * PX_PER_MM),
      (el.clientHeight - pad) / (doc.height * PX_PER_MM),
    );
    setState({ zoom: Math.max(0.05, Math.min(4, z)) });
  }, [doc.width, doc.height, setState]);

  useEffect(() => {
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitRequest]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {});
    ro.observe(el);
    fitToScreen();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toMm = (clientX: number, clientY: number) => {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  };

  const others = useMemo(
    () => (page?.objects ?? []).filter((o) => !selectedIds.includes(o.id)),
    [page, selectedIds],
  );

  const applySnap = (obj: { x: number; y: number; width: number; height: number }) => {
    const d = snap.distance;
    const vLines: number[] = [];
    const hLines: number[] = [];
    let x = obj.x;
    let y = obj.y;

    const candX: number[] = [];
    const candY: number[] = [];
    if (snap.page) {
      candX.push(0, doc.width, doc.margins.left, doc.width - doc.margins.right);
      candY.push(0, doc.height, doc.margins.top, doc.height - doc.margins.bottom);
    }
    if (snap.center) {
      candX.push(doc.width / 2);
      candY.push(doc.height / 2);
    }
    if (snap.objects) {
      for (const o of others) {
        candX.push(o.x, o.x + o.width);
        candY.push(o.y, o.y + o.height);
      }
    }
    candX.push(...guides.v);
    candY.push(...guides.h);

    const edgesX = [
      { v: x, o: 0 },
      { v: x + obj.width / 2, o: obj.width / 2 },
      { v: x + obj.width, o: obj.width },
    ];
    for (const e of edgesX) {
      for (const c of candX) {
        if (Math.abs(e.v - c) <= d) {
          x = c - e.o;
          vLines.push(c);
          break;
        }
      }
    }
    const edgesY = [
      { v: y, o: 0 },
      { v: y + obj.height / 2, o: obj.height / 2 },
      { v: y + obj.height, o: obj.height },
    ];
    for (const e of edgesY) {
      for (const c of candY) {
        if (Math.abs(e.v - c) <= d) {
          y = c - e.o;
          hLines.push(c);
          break;
        }
      }
    }
    if (snap.grid && !vLines.length) x = Math.round(x / gridSize) * gridSize;
    if (snap.grid && !hLines.length) y = Math.round(y / gridSize) * gridSize;
    setSnapLines({ v: vLines, h: hLines });
    return { x, y };
  };

  const onObjectPointerDown = (e: React.PointerEvent, obj: PlacedObject) => {
    if (obj.locked) return;
    e.stopPropagation();
    const ids = selectedIds.includes(obj.id)
      ? selectedIds
      : e.shiftKey
        ? [...selectedIds, obj.id]
        : [obj.id];
    setState({ selectedIds: ids });
    const p = toMm(e.clientX, e.clientY);
    const origins: Record<string, { x: number; y: number }> = {};
    for (const o of page?.objects ?? []) if (ids.includes(o.id)) origins[o.id] = { x: o.x, y: o.y };
    setDrag({ kind: "move", ids, startX: p.x, startY: p.y, origins });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onHandlePointerDown = (e: React.PointerEvent, obj: PlacedObject, handle: string) => {
    e.stopPropagation();
    const p = toMm(e.clientX, e.clientY);
    if (handle === "rotate") {
      setDrag({ kind: "rotate", id: obj.id, cx: obj.x + obj.width / 2, cy: obj.y + obj.height / 2 });
    } else {
      setDrag({ kind: "resize", id: obj.id, handle, startX: p.x, startY: p.y, origin: { ...obj } });
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = toMm(e.clientX, e.clientY);
    if (drag.kind === "move") {
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      const primary = page?.objects.find((o) => o.id === drag.ids[0]);
      let adj = { x: 0, y: 0 };
      if (primary) {
        const origin = drag.origins[primary.id]!;
        const raw = { x: origin.x + dx, y: origin.y + dy, width: primary.width, height: primary.height };
        const snapped = applySnap(raw);
        adj = { x: snapped.x - raw.x, y: snapped.y - raw.y };
      }
      mutate((proj) => {
        const pg = proj.pages[pageIndex];
        if (!pg) return;
        for (const o of pg.objects) {
          const origin = drag.origins[o.id];
          if (!origin || o.locked) continue;
          o.x = origin.x + dx + adj.x;
          o.y = origin.y + dy + adj.y;
        }
      }, false);
    } else if (drag.kind === "resize") {
      const o = drag.origin;
      const ratio = o.width / Math.max(0.01, o.height);
      const keepRatio = !e.altKey;
      let { x, y, width, height } = o;
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      if (drag.handle.includes("e")) width = Math.max(5, o.width + dx);
      if (drag.handle.includes("s")) height = Math.max(5, o.height + dy);
      if (drag.handle.includes("w")) {
        width = Math.max(5, o.width - dx);
        x = o.x + (o.width - width);
      }
      if (drag.handle.includes("n")) {
        height = Math.max(5, o.height - dy);
        y = o.y + (o.height - height);
      }
      if (keepRatio) {
        if (drag.handle === "e" || drag.handle === "w") height = width / ratio;
        else if (drag.handle === "n" || drag.handle === "s") width = height * ratio;
        else {
          height = width / ratio;
          if (drag.handle.includes("n")) y = o.y + (o.height - height);
        }
      }
      updateObject(o.id, { x, y, width, height }, false);
    } else if (drag.kind === "rotate") {
      const angle = (Math.atan2(p.y - drag.cy, p.x - drag.cx) * 180) / Math.PI + 90;
      const snapped = e.shiftKey ? Math.round(angle / 15) * 15 : Math.round(angle);
      updateObject(drag.id, { rotation: ((snapped % 360) + 360) % 360 }, false);
    }
  };

  const endDrag = () => {
    if (drag) {
      // push a single history entry for the finished gesture
      useStudio.setState((s) => ({ past: [...s.past.slice(-49), s.past[s.past.length - 1] ?? s.project] }));
    }
    setDrag(null);
    setSnapLines({ v: [], h: [] });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData("application/x-pls-asset");
    if (!assetId) return;
    const p = toMm(e.clientX, e.clientY);
    const target = [...(page?.objects ?? [])]
      .reverse()
      .find((o) => p.x >= o.x && p.x <= o.x + o.width && p.y >= o.y && p.y <= o.y + o.height);
    if (target) assignAssetToObject(target.id, assetId);
    else placeAsset(assetId, p);
  };

  const rulerTicks = (lengthMm: number) => {
    const step = zoom < 0.35 ? 50 : zoom < 0.8 ? 20 : 10;
    const ticks: number[] = [];
    for (let v = 0; v <= lengthMm; v += step) ticks.push(v);
    return ticks;
  };

  return (
    <div
      ref={wrapRef}
      className="relative flex-1 overflow-auto bg-canvas-bg"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onPointerDown={() => setState({ selectedIds: [] })}
    >
      <div className="flex min-h-full min-w-full items-center justify-center p-16">
        <div className="relative" style={{ paddingLeft: showRulers ? RULER : 0, paddingTop: showRulers ? RULER : 0 }}>
          {showRulers && (
            <>
              <div
                className="absolute left-[20px] top-0 flex h-[20px] items-end overflow-hidden border-b border-border bg-panel text-[9px] text-muted-foreground"
                style={{ width: pageW }}
              >
                {rulerTicks(doc.width).map((t) => (
                  <span key={t} className="absolute border-l border-border pl-1" style={{ left: t * scale, height: 8 }}>
                    <span className="absolute -top-3 left-1">{t}</span>
                  </span>
                ))}
              </div>
              <div
                className="absolute left-0 top-[20px] w-[20px] overflow-hidden border-r border-border bg-panel text-[9px] text-muted-foreground"
                style={{ height: pageH }}
              >
                {rulerTicks(doc.height).map((t) => (
                  <span key={t} className="absolute border-t border-border" style={{ top: t * scale, width: 8 }}>
                    <span className="absolute left-1 top-0">{t}</span>
                  </span>
                ))}
              </div>
            </>
          )}

          <div
            ref={pageRef}
            className="relative shadow-page"
            style={{
              width: pageW,
              height: pageH,
              background: doc.background === "transparent" ? "#ffffff" : doc.background,
              outline: bleed ? `${bleed}px solid oklch(0.72 0.16 25 / 0.18)` : undefined,
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(15,23,42,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,.12) 1px, transparent 1px)",
                  backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
                }}
              />
            )}

            {(doc.margins.top || doc.margins.left || doc.margins.right || doc.margins.bottom) > 0 && (
              <div
                className="pointer-events-none absolute border border-dashed border-sky-500/50"
                style={{
                  left: doc.margins.left * scale,
                  top: doc.margins.top * scale,
                  width: (doc.width - doc.margins.left - doc.margins.right) * scale,
                  height: (doc.height - doc.margins.top - doc.margins.bottom) * scale,
                }}
              />
            )}

            {showSafeArea && (
              <div
                className="pointer-events-none absolute border border-dashed border-emerald-500/60"
                style={{
                  left: safeArea * scale,
                  top: safeArea * scale,
                  width: (doc.width - safeArea * 2) * scale,
                  height: (doc.height - safeArea * 2) * scale,
                }}
              />
            )}

            {guides.v.map((g, i) => (
              <div key={`v${i}`} className="pointer-events-none absolute top-0 h-full w-px bg-cyan-400/70" style={{ left: g * scale }} />
            ))}
            {guides.h.map((g, i) => (
              <div key={`h${i}`} className="pointer-events-none absolute left-0 w-full border-t border-cyan-400/70" style={{ top: g * scale }} />
            ))}

            {(page?.objects ?? []).map((obj) => {
              const asset = obj.assetId ? assets[obj.assetId] : undefined;
              const selected = selectedIds.includes(obj.id);
              if (!obj.visible) return null;
              const inner =
                asset && obj.fit !== "stretch"
                  ? fitRect(obj.width, obj.height, asset.naturalWidth, asset.naturalHeight, obj.fit)
                  : { w: obj.width, h: obj.height };
              return (
                <div
                  key={obj.id}
                  className={cn("absolute", obj.locked ? "cursor-not-allowed" : "cursor-move")}
                  style={{
                    left: obj.x * scale,
                    top: obj.y * scale,
                    width: obj.width * scale,
                    height: obj.height * scale,
                    transform: `rotate(${obj.rotation}deg)`,
                  }}
                  onPointerDown={(e) => onObjectPointerDown(e, obj)}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    {asset ? (
                      <img
                        src={asset.src}
                        alt={obj.name}
                        draggable={false}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                        style={{ width: inner.w * scale, height: inner.h * scale }}
                      />
                    ) : obj.type === "text" ? (
                      <span
                        className="block p-1 leading-tight"
                        style={{ fontSize: (obj.fontSize ?? 12) * (scale / (96 / 25.4)) * 0.35, color: obj.color ?? "#111" }}
                      >
                        {obj.text}
                      </span>
                    ) : obj.type === "rect" ? (
                      <div className="h-full w-full border" style={{ borderColor: obj.color ?? "#111" }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-slate-400/70 bg-slate-100 text-[11px] font-medium text-slate-500">
                        Drop image here
                      </div>
                    )}
                  </div>

                  {selected && (
                    <>
                      <div className="pointer-events-none absolute -inset-px border-2 border-accent-ring" />
                      {!obj.locked &&
                        ["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((h) => (
                          <span
                            key={h}
                            onPointerDown={(e) => onHandlePointerDown(e, obj, h)}
                            className="absolute h-2.5 w-2.5 rounded-[2px] border border-white bg-accent-ring"
                            style={{
                              left: h.includes("w") ? -5 : h.includes("e") ? "calc(100% - 5px)" : "calc(50% - 5px)",
                              top: h.includes("n") ? -5 : h.includes("s") ? "calc(100% - 5px)" : "calc(50% - 5px)",
                              cursor: `${h}-resize`,
                            }}
                          />
                        ))}
                      {!obj.locked && (
                        <span
                          onPointerDown={(e) => onHandlePointerDown(e, obj, "rotate")}
                          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 cursor-grab rounded-full border border-white bg-accent-ring"
                          style={{ top: -24 }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {snapLines.v.map((v, i) => (
              <div key={`sv${i}`} className="pointer-events-none absolute top-0 h-full w-px bg-fuchsia-500" style={{ left: v * scale }} />
            ))}
            {snapLines.h.map((h, i) => (
              <div key={`sh${i}`} className="pointer-events-none absolute left-0 w-full border-t border-fuchsia-500" style={{ top: h * scale }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
