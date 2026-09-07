import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudio } from "@/store/useStudio";
import { projectToPls } from "@/services/projectStorage";
import { downloadBlob } from "@/engine/pdfEngine";
import { toast } from "sonner";

export function SaveAsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const project = useStudio((s) => s.project);
  const saveProject = useStudio((s) => s.saveProject);
  const [name, setName] = useState(project.name);
  const [downloadPls, setDownloadPls] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDownloadPls(true);
    }
  }, [open, project.name]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a project name.");
      return;
    }
    setBusy(true);
    try {
      await saveProject(trimmed);
      if (downloadPls) {
        const s = useStudio.getState();
        const blob = projectToPls({
          id: s.projectId,
          name: trimmed,
          savedAt: Date.now(),
          project: s.project,
          assets: s.assets,
        });
        downloadBlob(blob, `${trimmed.replace(/\s+/g, "_")}.pls`, "application/json");
      }
      toast.success(downloadPls ? "Saved and downloaded .pls" : "Project saved");
      onOpenChange(false);
    } catch {
      toast.error("Could not save the project.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save As</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="save-as-name">Project name</Label>
            <Input
              id="save-as-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Stored locally in this browser. Optionally download a .pls backup.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="download-pls"
              checked={downloadPls}
              onCheckedChange={(v) => setDownloadPls(!!v)}
            />
            <Label htmlFor="download-pls" className="text-sm font-normal">
              Download .pls file
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void submit()}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
