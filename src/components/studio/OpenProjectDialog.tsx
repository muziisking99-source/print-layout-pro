import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio } from "@/store/useStudio";
import {
  deleteProjectRecord,
  listProjectRecords,
  parsePlsFile,
  type StoredProject,
} from "@/services/projectStorage";

export function OpenProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const loadRecord = useStudio((s) => s.loadRecord);
  const [list, setList] = useState<StoredProject[]>([]);

  const refresh = async () => {
    try {
      setList(await listProjectRecords());
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Open project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-64">
          <div className="space-y-2 pr-2">
            {list.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No saved projects yet</p>
            )}
            {list.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{rec.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(rec.savedAt).toLocaleString()} · {rec.project.doc.paper} ·{" "}
                    {rec.project.pages.length} page(s)
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      loadRecord(rec);
                      onOpenChange(false);
                      toast.success(`Opened “${rec.name}”`);
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await deleteProjectRecord(rec.id);
                      await refresh();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pls,application/json";
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                try {
                  const rec = await parsePlsFile(file);
                  loadRecord(rec);
                  onOpenChange(false);
                  toast.success("Project imported");
                } catch {
                  toast.error("This file isn't a valid Print Layout Studio project.");
                }
              };
              input.click();
            }}
          >
            Import .pls
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
