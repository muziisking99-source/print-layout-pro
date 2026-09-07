import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useStudio } from "@/store/useStudio";

export function StudioContextMenu({ children }: { children: ReactNode }) {
  const selectedIds = useStudio((s) => s.selectedIds);
  const duplicateSelected = useStudio((s) => s.duplicateSelected);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const copySelected = useStudio((s) => s.copySelected);
  const paste = useStudio((s) => s.paste);
  const selectAll = useStudio((s) => s.selectAll);
  const setState = useStudio((s) => s.set);
  const reorder = useStudio((s) => s.reorder);
  const updateObject = useStudio((s) => s.updateObject);
  const project = useStudio((s) => s.project);
  const pageIndex = useStudio((s) => s.pageIndex);
  const obj = project.pages[pageIndex]?.objects.find((o) => o.id === selectedIds[0]);
  const hasSelection = selectedIds.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {hasSelection ? (
          <>
            <ContextMenuItem onClick={() => duplicateSelected()}>Duplicate</ContextMenuItem>
            <ContextMenuItem onClick={() => copySelected()}>Copy</ContextMenuItem>
            <ContextMenuItem onClick={() => paste()}>Paste</ContextMenuItem>
            <ContextMenuItem onClick={() => deleteSelected()}>Delete</ContextMenuItem>
            <ContextMenuSeparator />
            {obj && (
              <>
                <ContextMenuItem onClick={() => reorder(obj.id, "forward")}>Bring Forward</ContextMenuItem>
                <ContextMenuItem onClick={() => reorder(obj.id, "backward")}>Send Backward</ContextMenuItem>
                <ContextMenuItem onClick={() => reorder(obj.id, "front")}>Bring to Front</ContextMenuItem>
                <ContextMenuItem onClick={() => reorder(obj.id, "back")}>Send to Back</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => updateObject(obj.id, { locked: !obj.locked })}>
                  {obj.locked ? "Unlock" : "Lock"}
                </ContextMenuItem>
              </>
            )}
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => paste()}>Paste</ContextMenuItem>
            <ContextMenuItem onClick={() => selectAll()}>Select All</ContextMenuItem>
            <ContextMenuItem onClick={() => setState({ selectedIds: [] })}>Deselect</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                useStudio.getState().addObject({
                  type: "text",
                  name: "Text",
                  text: "Label text",
                  fontSize: 14,
                  color: "#111111",
                  width: 60,
                  height: 12,
                })
              }
            >
              Add Text
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                useStudio.getState().addObject({
                  type: "rect",
                  name: "Rectangle",
                  width: 40,
                  height: 30,
                  color: "#111111",
                  fill: "none",
                })
              }
            >
              Add Rectangle
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                const doc = useStudio.getState().project.doc;
                const guides = useStudio.getState().guides;
                setState({ guides: { ...guides, v: [...guides.v, doc.width / 2] } });
              }}
            >
              Add Vertical Guide
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                const doc = useStudio.getState().project.doc;
                const guides = useStudio.getState().guides;
                setState({ guides: { ...guides, h: [...guides.h, doc.height / 2] } });
              }}
            >
              Add Horizontal Guide
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
