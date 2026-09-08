import type { ReactNode } from "react";
import {
  FilePlus,
  FolderOpen,
  Save,
  FileDown,
  Eye,
  Undo2,
  Redo2,
  Printer,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Keyboard,
  Command,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudio } from "@/store/useStudio";
import { cn } from "@/lib/utils";
import { BrandMark } from "./ui-chrome";

function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolBtn({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tip label={label}>
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "pressable h-8 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-surface-raised hover:text-foreground",
          className,
        )}
      >
        {children}
      </Button>
    </Tip>
  );
}

const ALIGN_ITEMS = [
  ["left", "Align left", AlignLeft],
  ["center", "Align centre", AlignCenter],
  ["right", "Align right", AlignRight],
  ["top", "Align top", AlignStartVertical],
  ["middle", "Align middle", AlignCenterVertical],
  ["bottom", "Align bottom", AlignEndVertical],
  ["distribute-h", "Distribute horizontally", AlignHorizontalDistributeCenter],
  ["distribute-v", "Distribute vertically", AlignVerticalDistributeCenter],
] as const;

export function TopToolbar({
  onOpen,
  onSave,
  onSaveAs,
  onExport,
  onPreview,
  onPrint,
  onNew,
  onShortcuts,
  onCommandPalette,
}: {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onPreview: () => void;
  onPrint: () => void;
  onNew: () => void;
  onShortcuts: () => void;
  onCommandPalette: () => void;
}) {
  const project = useStudio((s) => s.project);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const past = useStudio((s) => s.past);
  const future = useStudio((s) => s.future);
  const quickTwoUpA4 = useStudio((s) => s.quickTwoUpA4);
  const align = useStudio((s) => s.align);
  const lastSavedAt = useStudio((s) => s.lastSavedAt);
  const setState = useStudio((s) => s.set);
  const printCheckOpen = useStudio((s) => s.printCheckOpen);

  return (
    <TooltipProvider delayDuration={180}>
      <header className="relative z-10 flex h-12 shrink-0 items-center gap-0.5 border-b border-border/70 bg-panel/98 px-2.5 backdrop-blur-md">
        <div className="mr-2 flex min-w-0 items-center gap-2.5 pl-0.5">
          <BrandMark />
          <div className="min-w-0">
            <p className="font-display truncate text-[13px] font-bold tracking-tight text-brand-gradient">
              Print Layout Pro
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              <span className="text-foreground/75">{project.name}</span>
              {lastSavedAt ? (
                <>
                  <span className="mx-1.5 text-border">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="status-pulse size-1.5 rounded-full bg-primary" />
                    saved {Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000))}s ago
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5 bg-border/70" />

        <ToolBtn label="New project (Ctrl+N)" onClick={onNew}>
          <FilePlus className="size-3.5" strokeWidth={1.75} />
          <span className="hidden lg:inline">New</span>
        </ToolBtn>
        <ToolBtn label="Open (Ctrl+O)" onClick={onOpen}>
          <FolderOpen className="size-3.5" strokeWidth={1.75} />
          <span className="hidden lg:inline">Open</span>
        </ToolBtn>
        <ToolBtn label="Save (Ctrl+S)" onClick={onSave}>
          <Save className="size-3.5" strokeWidth={1.75} />
          <span className="hidden lg:inline">Save</span>
        </ToolBtn>
        <ToolBtn label="Save As (Ctrl+Shift+S)" onClick={onSaveAs} className="hidden xl:inline-flex">
          Save As
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5 bg-border/70" />

        <ToolBtn label="Undo" disabled={!past.length} onClick={undo} className="size-8 px-0">
          <Undo2 className="size-3.5" strokeWidth={1.75} />
        </ToolBtn>
        <ToolBtn label="Redo" disabled={!future.length} onClick={redo} className="size-8 px-0">
          <Redo2 className="size-3.5" strokeWidth={1.75} />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 hidden h-5 bg-border/70 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="pressable hidden h-8 gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-surface-raised hover:text-foreground sm:inline-flex"
            >
              <AlignCenter className="size-3.5" strokeWidth={1.75} />
              Align
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {ALIGN_ITEMS.map(([mode, label, Icon]) => (
              <DropdownMenuItem key={mode} onClick={() => align(mode)}>
                <Icon className="size-3.5" strokeWidth={1.75} />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolBtn
          label="Print Check"
          onClick={() => setState({ printCheckOpen: !printCheckOpen })}
          className={cn(printCheckOpen && "bg-primary/15 text-primary")}
        >
          <ClipboardCheck className="size-3.5" strokeWidth={1.75} />
          <span className="hidden md:inline">Check</span>
        </ToolBtn>

        <div className="ml-auto flex items-center gap-1.5">
          <ToolBtn label="Command palette (Ctrl+K)" onClick={onCommandPalette} className="size-8 px-0">
            <Command className="size-3.5" strokeWidth={1.75} />
          </ToolBtn>
          <ToolBtn label="Shortcuts (?)" onClick={onShortcuts} className="size-8 px-0">
            <Keyboard className="size-3.5" strokeWidth={1.75} />
          </ToolBtn>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => quickTwoUpA4()}
            className="pressable h-8 rounded-md border border-border/50 bg-surface-raised px-2.5 text-xs font-semibold hover:bg-muted"
          >
            2 × A4
          </Button>
          <Tip label="Print preview">
            <Button
              size="sm"
              variant="outline"
              onClick={onPreview}
              className="pressable h-8 rounded-md border-border/60 bg-transparent px-2.5 text-xs"
            >
              <Eye className="size-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </Tip>
          <Tip label="Print">
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="pressable hidden h-8 rounded-md border-border/60 bg-transparent px-2.5 text-xs md:inline-flex"
            >
              <Printer className="size-3.5" strokeWidth={1.75} /> Print
            </Button>
          </Tip>
          <Button
            size="sm"
            onClick={onExport}
            className="cta-glow pressable h-8 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            <FileDown className="size-3.5" strokeWidth={1.75} /> Export PDF
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
}
