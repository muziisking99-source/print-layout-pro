import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStudio } from "@/store/useStudio";
import { buildPdf, downloadBlob, exportRaster } from "@/engine/pdfEngine";
import { issueCount, validateProject } from "@/engine/validate";
import { cn } from "@/lib/utils";

export function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const project = useStudio((s) => s.project);
  const assets = useStudio((s) => s.assets);
  const pageIndex = useStudio((s) => s.pageIndex);
  const [filename, setFilename] = useState("");
  const [quality, setQuality] = useState<"standard" | "high" | "maximum">("high");
  const [includeBleed, setIncludeBleed] = useState(project.doc.bleed > 0);
  const [cropMarks, setCropMarks] = useState(project.doc.cropMarks);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [busy, setBusy] = useState(false);
  const [force, setForce] = useState(false);

  const checks = useMemo(() => validateProject(project, assets), [project, assets]);
  const issues = issueCount(checks);
  const defaultName = `${project.name.replace(/\s+/g, "_")}_${project.doc.paper}_Print`;

  const runExport = async (kind: "pdf" | "png" | "jpeg") => {
    setBusy(true);
    try {
      const name = (filename.trim() || defaultName).replace(/\.pdf$/i, "");
      if (kind === "pdf") {
        const bytes = await buildPdf(project, assets, {
          filename: name,
          quality,
          includeBleed,
          cropMarks,
          includeBackground,
        });
        downloadBlob(bytes, `${name}.pdf`, "application/pdf");
        toast.success("PDF exported");
      } else {
        const blob = await exportRaster(project, assets, pageIndex, kind, 150);
        downloadBlob(blob, `${name}.${kind === "png" ? "png" : "jpg"}`, blob.type);
        toast.success(`${kind.toUpperCase()} exported (preview quality)`);
      }
      onOpenChange(false);
    } catch {
      toast.error("We couldn't generate the export. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Filename</Label>
            <Input
              value={filename}
              placeholder={defaultName}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>PDF quality</Label>
            <RadioGroup
              value={quality}
              onValueChange={(v) => setQuality(v as typeof quality)}
              className="gap-2"
            >
              {(
                [
                  ["standard", "Standard"],
                  ["high", "High"],
                  ["maximum", "Maximum"],
                ] as const
              ).map(([v, label]) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`q-${v}`} />
                  <Label htmlFor={`q-${v}`}>{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bleed"
              checked={includeBleed}
              onCheckedChange={(v) => setIncludeBleed(!!v)}
            />
            <Label htmlFor="bleed">PDF includes bleed area ({project.doc.bleed} mm)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="crop" checked={cropMarks} onCheckedChange={(v) => setCropMarks(!!v)} />
            <Label htmlFor="crop">Include crop marks</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bg"
              checked={includeBackground}
              onCheckedChange={(v) => setIncludeBackground(!!v)}
            />
            <Label htmlFor="bg">Include background</Label>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
            <p className="mb-2 font-semibold">
              {issues === 0 ? "Print check — ready to export" : `${issues} issue(s) found`}
            </p>
            <ul className="max-h-40 space-y-1 overflow-auto">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    c.level === "ok" && "text-emerald-400",
                    c.level === "warn" && "text-amber-400",
                    c.level === "error" && "text-red-400",
                  )}
                >
                  {c.level === "ok" ? "[ok]" : "[!]"} {c.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void runExport("png")}>
              PNG
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void runExport("jpeg")}>
              JPG
            </Button>
            {issues > 0 && !force ? (
              <Button disabled={busy} onClick={() => setForce(true)}>
                Export anyway
              </Button>
            ) : (
              <Button disabled={busy} onClick={() => void runExport("pdf")}>
                {busy ? "Exporting…" : "Export PDF"}
              </Button>
            )}
          </div>
          <p className="w-full text-[10px] text-muted-foreground">
            PNG/JPG are for previews only. Use PDF for print-ready output.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
