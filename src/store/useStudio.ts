import { create } from "zustand";
import type {
  DocumentSettings,
  ImageAsset,
  Page,
  PlacedObject,
  Project,
  Template,
} from "@/types/project";
import { orientedSize } from "@/engine/units";
import { computeImposition } from "@/engine/layout";
import {
  loadTemplates,
  saveTemplates,
  saveProjectRecord,
  type StoredProject,
} from "@/services/projectStorage";

export const uid = () => Math.random().toString(36).slice(2, 10);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function defaultDoc(): DocumentSettings {
  const { width, height } = orientedSize("A3", "landscape");
  return {
    paper: "A3",
    width,
    height,
    orientation: "landscape",
    unit: "mm",
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    marginsLocked: true,
    bleed: 0,
    gutterH: 0,
    gutterV: 0,
    cropMarks: false,
    background: "#ffffff",
  };
}

export function newProject(name = "Untitled Project"): Project {
  return { name, doc: defaultDoc(), pages: [{ id: uid(), objects: [] }] };
}

export interface Guides {
  v: number[];
  h: number[];
}

interface StudioState {
  projectId: string;
  project: Project;
  assets: Record<string, ImageAsset>;
  past: Project[];
  future: Project[];
  clipboard: PlacedObject[];
  selectedIds: string[];
  pageIndex: number;
  zoom: number;
  fitRequest: number;
  preview: boolean;
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  snap: { grid: boolean; objects: boolean; page: boolean; center: boolean; distance: number };
  guides: Guides;
  showSafeArea: boolean;
  safeArea: number;
  lastSavedAt: number | null;
  templates: Template[];

  set: <K extends keyof StudioState>(patch: Pick<StudioState, K> | Partial<StudioState>) => void;
  mutate: (fn: (p: Project) => void, record?: boolean) => void;
  undo: () => void;
  redo: () => void;

  addAssets: (assets: ImageAsset[]) => void;
  removeAsset: (id: string) => void;
  placeAsset: (assetId: string, at?: { x: number; y: number }) => void;
  assignAssetToObject: (objectId: string, assetId: string) => void;
  addObject: (obj: Partial<PlacedObject> & { type: PlacedObject["type"] }) => string;
  updateObject: (id: string, patch: Partial<PlacedObject>, record?: boolean) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  paste: () => void;
  reorder: (id: string, dir: "front" | "back" | "forward" | "backward") => void;
  align: (mode: string) => void;

  setDoc: (patch: Partial<DocumentSettings>) => void;
  autoArrange: (opts: {
    objectWidth: number;
    objectHeight: number;
    quantity?: number | undefined;
    allowRotation?: boolean | undefined;
    assetIds?: string[] | undefined;
  }) => void;
  quickTwoUpA4: () => void;

  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  setPageIndex: (i: number) => void;

  saveProject: (name?: string) => Promise<void>;
  loadRecord: (rec: StoredProject) => void;
  resetProject: () => void;
  saveTemplate: (name: string) => void;
  applyTemplate: (t: Template) => void;
  refreshTemplates: () => void;
}

export const useStudio = create<StudioState>((set, get) => ({
  projectId: uid(),
  project: newProject(),
  assets: {},
  past: [],
  future: [],
  clipboard: [],
  selectedIds: [],
  pageIndex: 0,
  zoom: 1,
  fitRequest: 0,
  preview: false,
  showGrid: false,
  gridSize: 10,
  showRulers: true,
  snap: { grid: true, objects: true, page: true, center: true, distance: 2 },
  guides: { v: [], h: [] },
  showSafeArea: false,
  safeArea: 3,
  lastSavedAt: null,
  templates: [],

  set: (patch) => set(patch as Partial<StudioState>),

  mutate: (fn, record = true) => {
    const { project, past } = get();
    const next = clone(project);
    fn(next);
    set({
      project: next,
      past: record ? [...past.slice(-49), project] : past,
      future: record ? [] : get().future,
    });
  },

  undo: () => {
    const { past, project, future } = get();
    const prev = past[past.length - 1];
    if (!prev) return;
    set({ project: prev, past: past.slice(0, -1), future: [project, ...future].slice(0, 50) });
  },

  redo: () => {
    const { past, project, future } = get();
    const next = future[0];
    if (!next) return;
    set({ project: next, past: [...past, project], future: future.slice(1) });
  },

  addAssets: (list) =>
    set((s) => ({
      assets: { ...s.assets, ...Object.fromEntries(list.map((a) => [a.id, a])) },
    })),

  removeAsset: (id) =>
    set((s) => {
      const assets = { ...s.assets };
      delete assets[id];
      return { assets };
    }),

  placeAsset: (assetId, at) => {
    const { assets, project, pageIndex } = get();
    const asset = assets[assetId];
    if (!asset) return;
    const ratio = asset.naturalWidth / Math.max(1, asset.naturalHeight);
    let w = Math.min(project.doc.width * 0.5, 210);
    let h = w / ratio;
    if (h > project.doc.height) {
      h = project.doc.height * 0.8;
      w = h * ratio;
    }
    get().mutate((p) => {
      const page = p.pages[pageIndex];
      if (!page) return;
      page.objects.push({
        id: uid(),
        type: "image",
        name: asset.name,
        assetId,
        x: at ? at.x - w / 2 : (p.doc.width - w) / 2,
        y: at ? at.y - h / 2 : (p.doc.height - h) / 2,
        width: w,
        height: h,
        rotation: 0,
        locked: false,
        visible: true,
        fit: "fit",
      });
    });
  },

  assignAssetToObject: (objectId, assetId) => {
    const asset = get().assets[assetId];
    if (!asset) return;
    get().mutate((p) => {
      for (const page of p.pages) {
        const obj = page.objects.find((o) => o.id === objectId);
        if (obj) {
          obj.assetId = assetId;
          obj.name = asset.name;
          obj.type = "image";
        }
      }
    });
  },

  addObject: (obj) => {
    const id = uid();
    const { pageIndex, project } = get();
    get().mutate((p) => {
      const page = p.pages[pageIndex];
      if (!page) return;
      page.objects.push({
        id,
        name: obj.name ?? (obj.type === "text" ? "Text" : "Object"),
        x: obj.x ?? 10,
        y: obj.y ?? 10,
        width: obj.width ?? Math.min(100, project.doc.width - 20),
        height: obj.height ?? 40,
        rotation: 0,
        locked: false,
        visible: true,
        fit: "fit",
        ...obj,
      } as PlacedObject);
    });
    set({ selectedIds: [id] });
    return id;
  },

  updateObject: (id, patch, record = true) => {
    get().mutate((p) => {
      for (const page of p.pages) {
        const obj = page.objects.find((o) => o.id === id);
        if (obj) Object.assign(obj, patch);
      }
    }, record);
  },

  deleteSelected: () => {
    const ids = get().selectedIds;
    if (!ids.length) return;
    get().mutate((p) => {
      for (const page of p.pages)
        page.objects = page.objects.filter((o) => !(ids.includes(o.id) && !o.locked));
    });
    set({ selectedIds: [] });
  },

  duplicateSelected: () => {
    const { selectedIds, pageIndex } = get();
    const newIds: string[] = [];
    get().mutate((p) => {
      const page = p.pages[pageIndex];
      if (!page) return;
      for (const o of page.objects.filter((o) => selectedIds.includes(o.id))) {
        const copy = { ...clone(o), id: uid(), x: o.x + 5, y: o.y + 5 };
        newIds.push(copy.id);
        page.objects.push(copy);
      }
    });
    set({ selectedIds: newIds });
  },

  copySelected: () => {
    const { selectedIds, project, pageIndex } = get();
    const page = project.pages[pageIndex];
    set({ clipboard: clone(page?.objects.filter((o) => selectedIds.includes(o.id)) ?? []) });
  },

  paste: () => {
    const { clipboard, pageIndex } = get();
    if (!clipboard.length) return;
    const ids: string[] = [];
    get().mutate((p) => {
      const page = p.pages[pageIndex];
      if (!page) return;
      for (const o of clipboard) {
        const copy = { ...clone(o), id: uid(), x: o.x + 5, y: o.y + 5 };
        ids.push(copy.id);
        page.objects.push(copy);
      }
    });
    set({ selectedIds: ids });
  },

  reorder: (id, dir) => {
    const { pageIndex } = get();
    get().mutate((p) => {
      const page = p.pages[pageIndex];
      if (!page) return;
      const i = page.objects.findIndex((o) => o.id === id);
      if (i < 0) return;
      const [obj] = page.objects.splice(i, 1);
      if (!obj) return;
      const target =
        dir === "front"
          ? page.objects.length
          : dir === "back"
            ? 0
            : dir === "forward"
              ? Math.min(page.objects.length, i + 1)
              : Math.max(0, i - 1);
      page.objects.splice(target, 0, obj);
    });
  },

  align: (mode) => {
    const { selectedIds, pageIndex, project } = get();
    const page = project.pages[pageIndex];
    if (!page || !selectedIds.length) return;
    const doc = project.doc;
    get().mutate((p) => {
      const objs = p.pages[pageIndex]!.objects.filter((o) => selectedIds.includes(o.id) && !o.locked);
      if (!objs.length) return;
      switch (mode) {
        case "left":
          objs.forEach((o) => (o.x = doc.margins.left));
          break;
        case "center":
          objs.forEach((o) => (o.x = (doc.width - o.width) / 2));
          break;
        case "right":
          objs.forEach((o) => (o.x = doc.width - doc.margins.right - o.width));
          break;
        case "top":
          objs.forEach((o) => (o.y = doc.margins.top));
          break;
        case "middle":
          objs.forEach((o) => (o.y = (doc.height - o.height) / 2));
          break;
        case "bottom":
          objs.forEach((o) => (o.y = doc.height - doc.margins.bottom - o.height));
          break;
        case "distribute-h": {
          const sorted = [...objs].sort((a, b) => a.x - b.x);
          const first = sorted[0]!;
          const last = sorted[sorted.length - 1]!;
          const span = last.x + last.width - first.x;
          const total = sorted.reduce((s, o) => s + o.width, 0);
          const gap = (span - total) / Math.max(1, sorted.length - 1);
          let cursor = first.x;
          sorted.forEach((o) => {
            o.x = cursor;
            cursor += o.width + gap;
          });
          break;
        }
        case "distribute-v": {
          const sorted = [...objs].sort((a, b) => a.y - b.y);
          const first = sorted[0]!;
          const last = sorted[sorted.length - 1]!;
          const span = last.y + last.height - first.y;
          const total = sorted.reduce((s, o) => s + o.height, 0);
          const gap = (span - total) / Math.max(1, sorted.length - 1);
          let cursor = first.y;
          sorted.forEach((o) => {
            o.y = cursor;
            cursor += o.height + gap;
          });
          break;
        }
      }
    });
  },

  setDoc: (patch) => {
    get().mutate((p) => {
      Object.assign(p.doc, patch);
      if (patch.paper || patch.orientation) {
        const paper = patch.paper ?? p.doc.paper;
        const orientation = patch.orientation ?? p.doc.orientation;
        if (paper !== "Custom") {
          const size = orientedSize(paper, orientation);
          p.doc.width = size.width;
          p.doc.height = size.height;
        } else if (patch.orientation) {
          const w = p.doc.width;
          const h = p.doc.height;
          p.doc.width = orientation === "landscape" ? Math.max(w, h) : Math.min(w, h);
          p.doc.height = orientation === "landscape" ? Math.min(w, h) : Math.max(w, h);
        }
      }
    });
    set({ fitRequest: get().fitRequest + 1 });
  },

  autoArrange: ({ objectWidth, objectHeight, quantity, allowRotation, assetIds }) => {
    const { project } = get();
    const doc = project.doc;
    const result = computeImposition({
      paperWidth: doc.width,
      paperHeight: doc.height,
      objectWidth,
      objectHeight,
      marginTop: doc.margins.top,
      marginRight: doc.margins.right,
      marginBottom: doc.margins.bottom,
      marginLeft: doc.margins.left,
      horizontalGap: doc.gutterH,
      verticalGap: doc.gutterV,
      allowRotation,
      quantity,
    });
    if (!result.positions.length) return;

    const sources = assetIds?.length ? assetIds : [];
    get().mutate((p) => {
      const pages: Page[] = [];
      for (let i = 0; i < result.pagesRequired; i++) pages.push({ id: uid(), objects: [] });
      result.positions.forEach((pos, i) => {
        const assetId = sources.length ? sources[i % sources.length] : undefined;
        const asset = assetId ? get().assets[assetId] : undefined;
        pages[pos.page]!.objects.push({
          id: uid(),
          type: "image",
          name: asset?.name ?? `Slot ${i + 1}`,
          assetId,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          rotation: 0,
          locked: false,
          visible: true,
          fit: "fit",
        });
      });
      p.pages = pages;
    });
    set({ pageIndex: 0, selectedIds: [] });
  },

  quickTwoUpA4: () => {
    get().setDoc({ paper: "A3", orientation: "landscape", margins: { top: 0, right: 0, bottom: 0, left: 0 }, gutterH: 0, gutterV: 0 });
    const ids = Object.keys(get().assets).slice(0, 2);
    get().autoArrange({ objectWidth: 210, objectHeight: 297, quantity: 2, allowRotation: false, assetIds: ids });
  },

  addPage: () => {
    get().mutate((p) => p.pages.push({ id: uid(), objects: [] }));
    set({ pageIndex: get().project.pages.length - 1, selectedIds: [] });
  },

  duplicatePage: () => {
    const i = get().pageIndex;
    get().mutate((p) => {
      const page = p.pages[i];
      if (!page) return;
      const copy: Page = { id: uid(), objects: page.objects.map((o) => ({ ...clone(o), id: uid() })) };
      p.pages.splice(i + 1, 0, copy);
    });
    set({ pageIndex: i + 1, selectedIds: [] });
  },

  deletePage: () => {
    const i = get().pageIndex;
    if (get().project.pages.length <= 1) return;
    get().mutate((p) => p.pages.splice(i, 1));
    set({ pageIndex: Math.max(0, i - 1), selectedIds: [] });
  },

  setPageIndex: (i) => set({ pageIndex: i, selectedIds: [] }),

  saveProject: async (name) => {
    const { projectId, project, assets } = get();
    const finalName = name ?? project.name;
    if (name) get().mutate((p) => (p.name = name), false);
    await saveProjectRecord({
      id: projectId,
      name: finalName,
      savedAt: Date.now(),
      project: { ...get().project, name: finalName },
      assets,
    });
    set({ lastSavedAt: Date.now() });
  },

  loadRecord: (rec) =>
    set({
      projectId: rec.id,
      project: rec.project,
      assets: rec.assets,
      pageIndex: 0,
      selectedIds: [],
      past: [],
      future: [],
    }),

  resetProject: () =>
    set({
      projectId: uid(),
      project: newProject(),
      assets: {},
      pageIndex: 0,
      selectedIds: [],
      past: [],
      future: [],
    }),

  saveTemplate: (name) => {
    const { project, templates } = get();
    const page = project.pages[get().pageIndex];
    const t: Template = {
      id: uid(),
      name,
      doc: clone(project.doc),
      objects: (page?.objects ?? []).map(({ assetId: _assetId, ...rest }) => clone(rest)),
    };
    const list = [...templates, t];
    saveTemplates(list);
    set({ templates: list });
  },

  applyTemplate: (t) => {
    get().mutate((p) => {
      p.doc = clone(t.doc);
      p.pages = [{ id: uid(), objects: t.objects.map((o) => ({ ...clone(o), id: uid() })) as PlacedObject[] }];
    });
    set({ pageIndex: 0, selectedIds: [], fitRequest: get().fitRequest + 1 });
  },

  refreshTemplates: () => set({ templates: loadTemplates() }),
}));
