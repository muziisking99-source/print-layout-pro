import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/store/useStudio";

const INTENTS = [
  {
    id: "a4a3",
    title: "2 × A4 on A3",
    hint: "Two A4 pages side-by-side on landscape A3",
  },
  {
    id: "labels",
    title: "Labels",
    hint: "Fill an A4 sheet with 100 × 50 mm labels",
  },
  {
    id: "cards",
    title: "Business cards",
    hint: "90 × 50 mm cards with bleed and crop marks",
  },
  {
    id: "photos",
    title: "Photos",
    hint: "Arrange 6×4″ photos on A4",
  },
  {
    id: "blank",
    title: "Blank document",
    hint: "Start with A3 landscape and place images yourself",
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 0 ? "What are you printing?" : "Add images, then export"}
          </DialogTitle>
        </DialogHeader>

        {step === 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {INTENTS.map((intent) => (
              <button
                key={intent.id}
                type="button"
                className="pressable rounded-xl border border-border/70 bg-surface/70 p-3 text-left hover:border-primary/40 hover:bg-primary/5"
                onClick={() => applyIntent(intent.id)}
              >
                <p className="font-display text-sm font-semibold tracking-tight">{intent.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{intent.hint}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              1. Use <span className="text-foreground">Images → Add</span> (or drop files) to upload.
            </p>
            <p>
              2. Drag an image onto a dashed slot on the page.
            </p>
            <p>
              3. Click <span className="text-foreground">Export PDF</span> when ready — pages use real millimetre sizes.
            </p>
            <p className="text-[11px]">
              Toggle print overlay (trim / bleed / safe) from Document settings or Ctrl+K.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
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
                <Button onClick={finish}>Start editing</Button>
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
