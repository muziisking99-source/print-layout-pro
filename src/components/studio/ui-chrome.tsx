import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PanelHeading({
  children,
  className,
  action,
}: {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </h3>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
  action,
}: {
  title: string;
  hint: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="studio-fade-in flex flex-col items-center gap-3 px-3 py-9 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-surface-raised text-muted-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,white_8%,transparent)]">
        {icon}
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-sm font-semibold tracking-tight text-foreground">{title}</p>
        <p className="max-w-[20ch] text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-muted/40 px-2 py-1.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="font-mono-nums truncate text-[11px] text-foreground/90">{value}</p>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "brand-mark flex size-8 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      aria-hidden
    >
      <span className="font-display text-[11px] font-extrabold tracking-tighter text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        PL
      </span>
    </div>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("panel-section space-y-3 p-3", className)}>{children}</section>;
}
