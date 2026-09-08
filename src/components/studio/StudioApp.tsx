import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TopToolbar } from "./TopToolbar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { StatusBar } from "./StatusBar";
import { CanvasStage } from "./CanvasStage";
import { ToolsBar } from "./ToolsBar";
import { StudioContextMenu } from "./ContextMenus";
import { ExportDialog } from "./ExportDialog";
import { PrintPreview } from "./PrintPreview";
import { OpenProjectDialog } from "./OpenProjectDialog";
import { SaveAsDialog } from "./SaveAsDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { CommandPalette } from "./CommandPalette";
import { OnboardingDialog } from "./OnboardingDialog";
import { useStudio } from "@/store/useStudio";
import { buildPdf } from "@/engine/pdfEngine";
import { loadImageFiles } from "@/services/imageLoader";
import {
  clearAutosaveDraft,
  loadAutosaveDraft,
  saveAutosaveDraft,
} from "@/services/projectStorage";

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

const ONBOARD_KEY = "pls:onboarded";

export function StudioApp() {
  const [exportOpen, setExportOpen] = useState(false);
  const [openOpen, setOpenOpen] = useState(false);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [draft, setDraft] = useState<ReturnType<typeof loadAutosaveDraft>>(null);
  const [newConfirm, setNewConfirm] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);

  const preview = useStudio((s) => s.preview);
  const setState = useStudio((s) => s.set);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const copySelected = useStudio((s) => s.copySelected);
  const cutSelected = useStudio((s) => s.cutSelected);
  const paste = useStudio((s) => s.paste);
  const duplicateSelected = useStudio((s) => s.duplicateSelected);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const selectAll = useStudio((s) => s.selectAll);
  const saveProject = useStudio((s) => s.saveProject);
  const resetProject = useStudio((s) => s.resetProject);
  const loadRecord = useStudio((s) => s.loadRecord);
  const refreshTemplates = useStudio((s) => s.refreshTemplates);
  const refreshProfiles = useStudio((s) => s.refreshProfiles);
  const updateObject = useStudio((s) => s.updateObject);
  const addAssets = useStudio((s) => s.addAssets);

  useEffect(() => {
    refreshTemplates();
    refreshProfiles();
    const d = loadAutosaveDraft();
    if (d && (!d.lastExplicitSaveAt || d.savedAt > d.lastExplicitSaveAt + 2000)) {
      setDraft(d);
      setRecoverOpen(true);
    } else if (typeof localStorage !== "undefined" && !localStorage.getItem(ONBOARD_KEY)) {
      setOnboardOpen(true);
    }
  }, [refreshTemplates, refreshProfiles]);

  useEffect(() => {
    const openExport = () => setExportOpen(true);
    window.addEventListener("pls-open-export", openExport);
    return () => window.removeEventListener("pls-open-export", openExport);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const s = useStudio.getState();
      saveAutosaveDraft({
        projectId: s.projectId,
        savedAt: Date.now(),
        project: s.project,
        assets: s.assets,
        lastExplicitSaveAt: s.lastSavedAt,
      });
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const handleSave = useCallback(async () => {
    await saveProject();
    toast.success("Project saved");
  }, [saveProject]);

  const handlePrint = useCallback(async () => {
    toast.message("For accurate physical dimensions, select Actual Size or 100% scaling. Do not select Fit to Page.");
    try {
      const s = useStudio.getState();
      const bytes = await buildPdf(s.project, s.assets, {
        filename: s.project.name,
        quality: "high",
        includeBleed: s.project.doc.bleed > 0,
        cropMarks: s.project.doc.cropMarks,
        includeBackground: true,
      });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank");
      if (w) {
        w.addEventListener("load", () => {
          w.focus();
          w.print();
        });
      } else {
        toast.error("Pop-up blocked — allow pop-ups to print, or use Export PDF.");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("We couldn't prepare the print job. Please try again.");
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const s = useStudio.getState();

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if (!mod && e.key === "?" ) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setNewConfirm(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setOpenOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSaveAsOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "x") {
        e.preventDefault();
        cutSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        paste();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        selectAll();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (e.key === "Escape") {
        setState({ selectedIds: [] });
        return;
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        if (!s.selectedIds.length) return;
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        const page = s.project.pages[s.pageIndex];
        if (!page) return;
        for (const id of s.selectedIds) {
          const obj = page.objects.find((o) => o.id === id);
          if (!obj || obj.locked) continue;
          updateObject(id, { x: obj.x + dx, y: obj.y + dy });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    handleSave,
    undo,
    redo,
    copySelected,
    cutSelected,
    paste,
    duplicateSelected,
    deleteSelected,
    selectAll,
    setState,
    updateObject,
  ]);

  return (
    <div
      className="dark flex h-svh flex-col overflow-hidden bg-background font-sans text-foreground antialiased"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        void loadImageFiles(e.dataTransfer.files).then(({ assets, errors }) => {
          if (assets.length) {
            addAssets(assets);
            toast.success(`Added ${assets.length} image${assets.length === 1 ? "" : "s"}`);
          }
          for (const err of errors) toast.error(`${err.name}: ${err.message}`);
        });
      }}
    >
      <TopToolbar
        onNew={() => setNewConfirm(true)}
        onOpen={() => setOpenOpen(true)}
        onSave={() => void handleSave()}
        onSaveAs={() => setSaveAsOpen(true)}
        onExport={() => setExportOpen(true)}
        onPreview={() => setState({ preview: true })}
        onPrint={() => void handlePrint()}
        onShortcuts={() => setShortcutsOpen(true)}
        onCommandPalette={() => setCmdOpen(true)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <LeftSidebar />
        <StudioContextMenu>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ToolsBar />
            <CanvasStage />
          </div>
        </StudioContextMenu>
        <RightSidebar />
      </div>
      <StatusBar />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <OpenProjectDialog open={openOpen} onOpenChange={setOpenOpen} />
      <SaveAsDialog open={saveAsOpen} onOpenChange={setSaveAsOpen} />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onNew={() => setNewConfirm(true)}
        onOpen={() => setOpenOpen(true)}
        onSave={() => void handleSave()}
        onSaveAs={() => setSaveAsOpen(true)}
        onExport={() => setExportOpen(true)}
        onPreview={() => setState({ preview: true })}
        onPrint={() => void handlePrint()}
        onShortcuts={() => setShortcutsOpen(true)}
      />
      <OnboardingDialog
        open={onboardOpen}
        onOpenChange={(v) => {
          setOnboardOpen(v);
          if (!v) localStorage.setItem(ONBOARD_KEY, "1");
        }}
      />
      {preview && <PrintPreview onBack={() => setState({ preview: false })} />}

      <AlertDialog open={recoverOpen} onOpenChange={setRecoverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recover previous project?</AlertDialogTitle>
            <AlertDialogDescription>
              An auto-saved draft was found
              {draft ? ` (“${draft.project.name}”, ${new Date(draft.savedAt).toLocaleString()})` : ""}.
              Restore it or discard and start fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                clearAutosaveDraft();
                setDraft(null);
                if (!localStorage.getItem(ONBOARD_KEY)) setOnboardOpen(true);
              }}
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (draft) {
                  loadRecord({
                    id: draft.projectId,
                    name: draft.project.name,
                    savedAt: draft.savedAt,
                    project: draft.project,
                    assets: draft.assets,
                  });
                  toast.success("Draft restored");
                  localStorage.setItem(ONBOARD_KEY, "1");
                }
                setDraft(null);
              }}
            >
              Recover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={newConfirm} onOpenChange={setNewConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new project?</AlertDialogTitle>
            <AlertDialogDescription>
              Unsaved changes may be lost. Save first if you need to keep this work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetProject();
                clearAutosaveDraft();
                toast.message("New project created");
                setOnboardOpen(true);
              }}
            >
              New project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster theme="dark" />
    </div>
  );
}
