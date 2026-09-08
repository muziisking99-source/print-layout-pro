import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/store/useStudio";
import { BrandMark } from "./ui-chrome";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  Tags,
  CreditCard,
  Images,
  FilePlus,
} from "lucide-react";

const INTENTS = [
  {
    id: "a4a3",
    title: "2 × A4 on A3",
    hint: "Two A4 pages side-by-side on landscape A3",
    icon: LayoutTemplate,
  },
  {
    id: "labels",
    title: "Labels",
    hint: "Fill an A4 sheet with 100 × 50 mm labels",
    icon: Tags,
  },
  {
    id: "cards",
    title: "Business cards",
    hint: "90 × 50 mm cards with bleed and crop marks",
    icon: CreditCard,
  },
  {
    id: "photos",
    title: "Photos",
    hint: "Arrange 6×4″ photos on A4",
    icon: Images,
  },
  {
    id: "blank",
    title: "Blank document",
    hint: "Start with A3 landscape and place images yourself",
    icon: FilePlus,
  },
] as const;

export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const quickTwoUpA4 = useStudio((s) => s.quickTwoUpA4);
  const fillPageWithSize = useStudio((s) => s.fillPageWithSize);
  const setDoc = useStudio((s) => s.setDoc);
  const setState = useStudio((s) => s.set);

  const applyIntent = (id: (typeof INTENTS)[number]["id"]) => {
    if (id === "a4a3") quickTwoUpA4();
    else if (id === "labels") {
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 5,
        gutterV: 5,
        bleed: 0,
        cropMarks: false,
      });
      fillPageWithSize(100, 50, { allowRotation: true });
    } else if (id === "cards") {
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 3,
        gutterV: 3,
        bleed: 3,
        cropMarks: true,
      });
      fillPageWithSize(90, 50, { allowRotation: true });
    } else if (id === "photos") {
      setDoc({
        paper: "A4",
        orientation: "portrait",
        margins: { top: 5, right: 5, bottom: 5, left: 5 },
        gutterH: 3,
        gutterV: 3,
        bleed: 0,
        cropMarks: false,
      });
      fillPageWithSize(152.4, 101.6, { allowRotation: true });
    } else {
      setDoc({ paper: "A3", orientation: "landscape" });
    }
    setStep(1);
  };

  const finish = () => {
    onOpenChange(false);
    setStep(0);
    toast.message("Tip: press ? for shortcuts, or Ctrl+K for commands");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden border-border/70 bg-card p-0">
        <div className="relative border-b border-border/60 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,#ff6b45_28%,transparent),transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_oklab,#2dd4bf_22%,transparent),transparent_50%)] px-6 pb-5 pt-6">
          <div className="mb-3 flex items-center gap-3">
            <BrandMark className="size-10 rounded-xl" />
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight text-brand-gradient">
                Print Layout Pro
              </p>
              <p className="text-[11px] text-muted-foreground">Canva simplicity · print accuracy</p>
            </div>
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-base font-bold tracking-tight">
              {step === 0 ? "What are you printing?" : "Add images, then export"}
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              {step === 0
                ? "Pick a starting layout — you can change everything later."
                : "Upload, drop into slots, then export a millimetre-accurate PDF."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4">
          {step === 0 ? (
            <div className="studio-stagger grid gap-2 sm:grid-cols-2">
              {INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  type="button"
                  className={cn(
                    "pressable cursor-pointer rounded-xl border border-border/70 bg-surface/70 p-3 text-left",
                    "hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  onClick={() => applyIntent(intent.id)}
                >
                  <intent.icon className="mb-2 size-4 text-primary" strokeWidth={1.75} aria-hidden />
                  <p className="font-display text-sm font-semibold tracking-tight">{intent.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{intent.hint}</p>
                </button>
              ))}
            </div>
          ) : (
            <ol className="studio-stagger space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono-nums text-[11px] font-bold text-primary">
                  1
                </span>
                <p>
                  Use <span className="text-foreground">Images → Add</span> (or drop files) to upload.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono-nums text-[11px] font-bold text-primary">
                  2
                </span>
                <p>Drag an image onto a dashed slot on the page.</p>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono-nums text-[11px] font-bold text-primary">
                  3
                </span>
                <p>
                  Click <span className="text-foreground">Export PDF</span> — pages use real millimetre sizes.
                </p>
              </li>
            </ol>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-between">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setState({ printCheckOpen: true });
                    finish();
                  }}
                >
                  Open Print Check
                </Button>
                <Button className="cta-glow font-bold" onClick={finish}>
                  Start editing
                </Button>
              </div>
            </>
          ) : (
            <Button variant="ghost" className="ml-auto" onClick={finish}>
              Skip
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
