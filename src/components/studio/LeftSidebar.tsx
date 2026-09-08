import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageLibrary } from "./ImageLibrary";
import { LayersPanel } from "./LayersPanel";
import { TemplatesPanel } from "./TemplatesPanel";

export function LeftSidebar() {
  return (
    <aside className="flex w-[17rem] shrink-0 flex-col border-r border-border/70 bg-panel text-panel-foreground">
      <Tabs defaultValue="images" className="flex h-full flex-col">
        <div className="border-b border-border/60 p-2">
          <TabsList className="grid h-9 w-full grid-cols-3 rounded-lg bg-surface p-0.5">
            <TabsTrigger
              value="images"
              className="rounded-md text-[11px] font-semibold tracking-wide data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_0_color-mix(in_oklab,white_8%,transparent)]"
            >
              Images
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              className="rounded-md text-[11px] font-semibold tracking-wide data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_0_color-mix(in_oklab,white_8%,transparent)]"
            >
              Layers
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="rounded-md text-[11px] font-semibold tracking-wide data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_0_color-mix(in_oklab,white_8%,transparent)]"
            >
              Templates
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="images" className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <ImageLibrary />
        </TabsContent>
        <TabsContent value="layers" className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <LayersPanel />
        </TabsContent>
        <TabsContent value="templates" className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
