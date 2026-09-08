import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
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
    <div
      className={cn(
        "space-y-3 rounded-xl border p-3",
        issues === 0
          ? "border-[color-mix(in_oklab,#2dd4bf_45%,transparent)] bg-[color-mix(in_oklab,#2dd4bf_10%,transparent)]"
          : "border-warning/35 bg-warning/8",
      )}
    >
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
      <div className="flex items-center gap-2">
        {issues === 0 ? (
          <CheckCircle2 className="size-4 text-success" strokeWidth={1.75} aria-hidden />
        ) : (
          <AlertTriangle className="size-4 text-warning" strokeWidth={1.75} aria-hidden />
        )}
        <p className="text-[12px] font-semibold text-foreground">
          {issues === 0 ? "Ready to export" : `${issues} issue(s) to review`}
        </p>
      </div>
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
                  "flex w-full items-start gap-1.5 text-left",
                  jumpable && "cursor-pointer underline-offset-2 hover:underline",
                  c.level === "ok" && "text-success",
                  c.level === "warn" && "text-warning",
                  c.level === "error" && "text-destructive",
                )}
              >
                {c.level === "ok" ? (
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0" strokeWidth={2} aria-hidden />
                ) : c.level === "warn" ? (
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" strokeWidth={2} aria-hidden />
                ) : (
                  <XCircle className="mt-0.5 size-3 shrink-0" strokeWidth={2} aria-hidden />
                )}
                <span>{c.message}</span>
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
        className="cta-glow h-8 w-full text-[11px] font-bold"
        onClick={() => window.dispatchEvent(new CustomEvent("pls-open-export"))}
      >
        {issues > 0 ? "Export anyway…" : "Export…"}
      </Button>
    </div>
  );
}
