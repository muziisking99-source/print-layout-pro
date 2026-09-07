import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/store/useStudio";
import { issueCount, validateProject } from "@/engine/validate";
import { PanelHeading } from "./ui-chrome";
import { cn } from "@/lib/utils";

export function PrintCheckPanel() {
  const project = useStudio((s) => s.project);
  const assets = useStudio((s) => s.assets);
  const printCheckOpen = useStudio((s) => s.printCheckOpen);
  const showPrintOverlay = useStudio((s) => s.showPrintOverlay);
  const setState = useStudio((s) => s.set);
  const setDoc = useStudio((s) => s.setDoc);

  const checks = useMemo(() => validateProject(project, assets), [project, assets]);
  const issues = issueCount(checks);

  if (!printCheckOpen) return null;

  const jumpTo = (checkId: string) => {
    const m = /^(?:out|dpi)-(.+)$/.exec(checkId);
    if (!m?.[1]) return;
    const objectId = m[1];
    let pageIndex = 0;
    for (let i = 0; i < project.pages.length; i++) {
      if (project.pages[i]?.objects.some((o) => o.id === objectId)) {
        pageIndex = i;
        break;
      }
    }
    setState({ pageIndex, selectedIds: [objectId] });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-surface/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading>Print check</PanelHeading>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[10px]"
          onClick={() => setState({ printCheckOpen: false })}
        >
          Close
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {issues === 0 ? "Ready to export" : `${issues} issue(s) to review`}
      </p>
      <ul className="max-h-40 space-y-1 overflow-auto text-[11px]">
        {checks.map((c) => {
          const jumpable = /^(?:out|dpi)-/.test(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={!jumpable}
                onClick={() => jumpTo(c.id)}
                className={cn(
                  "w-full text-left",
                  jumpable && "underline-offset-2 hover:underline",
                  c.level === "ok" && "text-emerald-400/90",
                  c.level === "warn" && "text-amber-300/90",
                  c.level === "error" && "text-rose-400/90",
                )}
              >
                {c.level === "ok" ? "[ok]" : "[!]"} {c.message}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">Print overlay labels</Label>
        <Switch
          checked={showPrintOverlay}
          onCheckedChange={(v) =>
            setState({
              showPrintOverlay: v,
              showSafeArea: v ? true : useStudio.getState().showSafeArea,
            })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[10px]"
          onClick={() => setDoc({ bleed: Math.max(3, project.doc.bleed) })}
        >
          Set 3 mm bleed
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[10px]"
          onClick={() => setDoc({ cropMarks: true })}
        >
          Enable crop marks
        </Button>
      </div>
      <Button
        size="sm"
        className="h-8 w-full text-[11px]"
        onClick={() => window.dispatchEvent(new CustomEvent("pls-open-export"))}
      >
        {issues > 0 ? "Export anyway…" : "Export…"}
      </Button>
    </div>
  );
}
