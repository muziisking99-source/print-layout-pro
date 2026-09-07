import { Eye, EyeOff, Lock, Unlock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio } from "@/store/useStudio";
import { cn } from "@/lib/utils";
import { EmptyState, PanelHeading } from "./ui-chrome";

export function LayersPanel() {
  const project = useStudio((s) => s.project);
  const pageIndex = useStudio((s) => s.pageIndex);
  const selectedIds = useStudio((s) => s.selectedIds);
  const setState = useStudio((s) => s.set);
  const updateObject = useStudio((s) => s.updateObject);
  const reorder = useStudio((s) => s.reorder);
  const page = project.pages[pageIndex];
  const layers = [...(page?.objects ?? [])].reverse();

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <PanelHeading>Stack</PanelHeading>
      <ScrollArea className="flex-1">
        <div className="studio-stagger flex flex-col gap-1 pr-2">
          {layers.length === 0 && (
            <EmptyState
              icon={<Layers className="size-4" strokeWidth={1.5} />}
              title="Empty page"
              hint="Place images or run Auto Arrange to build a stack."
            />
          )}
          {layers.map((obj) => {
            const selected = selectedIds.includes(obj.id);
            return (
              <div
                key={obj.id}
                className={cn(
                  "pressable flex items-center gap-1 rounded-lg border px-1 py-1 transition-colors",
                  selected
                    ? "border-primary/35 bg-primary/10"
                    : "border-transparent hover:bg-surface-raised",
                )}
                onClick={() => setState({ selectedIds: [obj.id] })}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateObject(obj.id, { visible: !obj.visible });
                  }}
                >
                  {obj.visible ? (
                    <Eye className="size-3.5" strokeWidth={1.75} />
                  ) : (
                    <EyeOff className="size-3.5" strokeWidth={1.75} />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateObject(obj.id, { locked: !obj.locked });
                  }}
                >
                  {obj.locked ? (
                    <Lock className="size-3.5" strokeWidth={1.75} />
                  ) : (
                    <Unlock className="size-3.5" strokeWidth={1.75} />
                  )}
                </Button>
                <Input
                  value={obj.name}
                  className="h-7 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateObject(obj.id, { name: e.target.value }, false)}
                  onBlur={(e) => updateObject(obj.id, { name: e.target.value })}
                />
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    className="px-1 text-[9px] text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(obj.id, "forward");
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="px-1 text-[9px] text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(obj.id, "backward");
                    }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
