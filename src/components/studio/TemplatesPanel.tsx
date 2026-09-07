import { useState } from "react";
import { toast } from "sonner";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio } from "@/store/useStudio";
import { EmptyState, PanelHeading } from "./ui-chrome";

export function TemplatesPanel() {
  const templates = useStudio((s) => s.templates);
  const saveTemplate = useStudio((s) => s.saveTemplate);
  const applyTemplate = useStudio((s) => s.applyTemplate);
  const refreshTemplates = useStudio((s) => s.refreshTemplates);
  const [name, setName] = useState("");

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <PanelHeading>Templates</PanelHeading>
      <div className="flex gap-2">
        <Input
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 rounded-lg border-border/70 bg-surface text-xs"
        />
        <Button
          size="sm"
          className="pressable h-8 rounded-lg text-xs"
          onClick={() => {
            const n = name.trim() || "Untitled template";
            saveTemplate(n);
            setName("");
            toast.success("Template saved");
          }}
        >
          Save
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="studio-stagger flex flex-col gap-2 pr-2">
          {templates.length === 0 && (
            <EmptyState
              icon={<LayoutTemplate className="size-4" strokeWidth={1.5} />}
              title="No templates"
              hint="Save paper size, gutters, and object slots without embedding images."
            />
          )}
          {templates.map((t) => (
            <div
              key={t.id}
              className="pressable flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-surface/70 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium tracking-tight">{t.name}</p>
                <p className="font-mono-nums text-[10px] text-muted-foreground">
                  {t.doc.paper} · {t.doc.orientation} · {t.objects.length} objs
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="pressable h-7 rounded-md text-[11px]"
                onClick={() => {
                  applyTemplate(t);
                  toast.success(`Applied “${t.name}”`);
                }}
              >
                Apply
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button size="sm" variant="ghost" className="text-[11px]" onClick={() => refreshTemplates()}>
        Refresh list
      </Button>
    </div>
  );
}
