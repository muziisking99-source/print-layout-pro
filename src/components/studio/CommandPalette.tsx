import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStudio } from "@/store/useStudio";
import { toast } from "sonner";

export function CommandPalette({
  open,
  onOpenChange,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExport,
  onPreview,
  onPrint,
  onShortcuts,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onPreview: () => void;
  onPrint: () => void;
  onShortcuts: () => void;
}) {
  const quickTwoUpA4 = useStudio((s) => s.quickTwoUpA4);
  const addObject = useStudio((s) => s.addObject);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const setState = useStudio((s) => s.set);

  useEffect(() => {
    if (!open) return;
  }, [open]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands…" />
      <CommandList>
        <CommandEmpty>No matching command.</CommandEmpty>
        <CommandGroup heading="File">
          <CommandItem onSelect={() => run(onNew)}>New project</CommandItem>
          <CommandItem onSelect={() => run(onOpen)}>Open project</CommandItem>
          <CommandItem onSelect={() => run(() => void onSave())}>Save</CommandItem>
          <CommandItem onSelect={() => run(onSaveAs)}>Save As</CommandItem>
          <CommandItem onSelect={() => run(onExport)}>Export PDF</CommandItem>
          <CommandItem onSelect={() => run(onPrint)}>Print</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layout">
          <CommandItem
            onSelect={() =>
              run(() => {
                quickTwoUpA4();
                toast.success("2 × A4 on A3");
              })
            }
          >
            2 × A4 on A3
          </CommandItem>
          <CommandItem onSelect={() => run(onPreview)}>Print preview</CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => setState({ fitRequest: useStudio.getState().fitRequest + 1 }))
            }
          >
            Fit page to screen
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => setState({ showPrintOverlay: !useStudio.getState().showPrintOverlay }))
            }
          >
            Toggle print overlay
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Insert">
          <CommandItem
            onSelect={() =>
              run(() =>
                addObject({
                  type: "text",
                  name: "Text",
                  text: "Label text",
                  fontSize: 14,
                  color: "#111111",
                  width: 60,
                  height: 12,
                }),
              )
            }
          >
            Add text
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() =>
                addObject({
                  type: "rect",
                  name: "Rectangle",
                  width: 40,
                  height: 30,
                  color: "#111111",
                  fill: "none",
                }),
              )
            }
          >
            Add rectangle
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() =>
                addObject({
                  type: "circle",
                  name: "Circle",
                  width: 30,
                  height: 30,
                  color: "#111111",
                  fill: "none",
                }),
              )
            }
          >
            Add circle
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Edit">
          <CommandItem onSelect={() => run(undo)}>Undo</CommandItem>
          <CommandItem onSelect={() => run(redo)}>Redo</CommandItem>
          <CommandItem onSelect={() => run(onShortcuts)}>Keyboard shortcuts</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
