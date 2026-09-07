import { Type, Square, Circle, Minus, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudio } from "@/store/useStudio";
import { toast } from "sonner";

export function ToolsBar() {
  const addObject = useStudio((s) => s.addObject);
  const catalogFromAssets = useStudio((s) => s.catalogFromAssets);
  const assets = useStudio((s) => s.assets);
  const doc = useStudio((s) => s.project.doc);

  const tools = [
    {
      id: "text",
      label: "Add text",
      icon: Type,
      run: () =>
        addObject({
          type: "text",
          name: "Text",
          text: "Label text",
          fontSize: 14,
          color: "#111111",
          width: 60,
          height: 12,
          bold: false,
          italic: false,
          align: "left",
        }),
    },
    {
      id: "rect",
      label: "Rectangle",
      icon: Square,
      run: () =>
        addObject({
          type: "rect",
          name: "Rectangle",
          width: 40,
          height: 30,
          color: "#111111",
          strokeWidth: 0.5,
          fill: "none",
        }),
    },
    {
      id: "circle",
      label: "Circle",
      icon: Circle,
      run: () =>
        addObject({
          type: "circle",
          name: "Circle",
          width: 30,
          height: 30,
          color: "#111111",
          strokeWidth: 0.5,
          fill: "none",
        }),
    },
    {
      id: "line",
      label: "Line",
      icon: Minus,
      run: () =>
        addObject({
          type: "line",
          name: "Line",
          width: 50,
          height: 0.1,
          color: "#111111",
          strokeWidth: 0.75,
        }),
    },
  ] as const;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1">
        <div className="pointer-events-auto glass-panel flex flex-col gap-0.5 rounded-xl p-1.5">
          {tools.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="pressable size-9 rounded-lg text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                  onClick={() => {
                    t.run();
                    toast.message(`${t.label} added`);
                  }}
                >
                  <t.icon className="size-4" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.label}</TooltipContent>
            </Tooltip>
          ))}
          <div className="my-0.5 h-px bg-border/70" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="pressable size-9 rounded-lg text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                onClick={() => {
                  const ids = Object.keys(assets);
                  if (!ids.length) {
                    toast.error("Add images first for catalog mode.");
                    return;
                  }
                  catalogFromAssets(ids);
                  toast.success(`Catalog: ${ids.length} page(s) on ${doc.paper}`);
                }}
              >
                <LayoutList className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Catalog — one image per page</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
