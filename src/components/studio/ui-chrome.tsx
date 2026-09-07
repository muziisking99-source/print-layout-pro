import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PanelHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-display text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="studio-fade-in flex flex-col items-center gap-3 px-4 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised text-muted-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-[18ch] text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="font-mono-nums truncate text-[11px] text-foreground/90">{value}</p>
    </div>
  );
}
