import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const SHORTCUTS: { group: string; items: { keys: string; action: string }[] }[] = [
  {
    group: "File",
    items: [
      { keys: "Ctrl + N", action: "New project" },
      { keys: "Ctrl + O", action: "Open project" },
      { keys: "Ctrl + S", action: "Save" },
      { keys: "Ctrl + Shift + S", action: "Save As" },
      { keys: "Ctrl + K", action: "Command palette" },
      { keys: "?", action: "Keyboard shortcuts" },
    ],
  },
  {
    group: "Edit",
    items: [
      { keys: "Ctrl + Z", action: "Undo" },
      { keys: "Ctrl + Shift + Z", action: "Redo" },
      { keys: "Ctrl + C", action: "Copy" },
      { keys: "Ctrl + X", action: "Cut" },
      { keys: "Ctrl + V", action: "Paste" },
      { keys: "Ctrl + D", action: "Duplicate" },
      { keys: "Delete", action: "Delete object" },
      { keys: "Ctrl + A", action: "Select all" },
      { keys: "Escape", action: "Deselect" },
    ],
  },
  {
    group: "Move",
    items: [
      { keys: "Arrow keys", action: "Nudge 1 mm" },
      { keys: "Shift + Arrow", action: "Nudge 5 mm" },
      { keys: "Alt + drag resize", action: "Unlock aspect ratio" },
    ],
  },
];

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-5">
            {SHORTCUTS.map((g) => (
              <div key={g.group}>
                <p className="mb-2 font-display text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {g.group}
                </p>
                <ul className="space-y-1.5">
                  {g.items.map((item) => (
                    <li key={item.keys} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground/90">{item.action}</span>
                      <kbd className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono-nums text-[11px] text-muted-foreground">
                        {item.keys}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
