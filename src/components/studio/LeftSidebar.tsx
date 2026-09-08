import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageLibrary } from "./ImageLibrary";
import { LayersPanel } from "./LayersPanel";
import { TemplatesPanel } from "./TemplatesPanel";

export function LeftSidebar() {
  return (
    <aside className="studio-sidebar flex w-[17rem] shrink-0 flex-col border-r border-stone-700 bg-[#0c0b0a] text-stone-50">
      <Tabs defaultValue="images" className="flex h-full flex-col">
        <div className="border-b border-stone-700 p-2">
          <TabsList className="grid h-9 w-full grid-cols-3 rounded-lg bg-stone-900 p-0.5">
            <TabsTrigger
              value="images"
              className="rounded-md text-[11px] font-semibold tracking-wide text-stone-300 data-[state=active]:bg-stone-700 data-[state=active]:text-stone-50 data-[state=active]:shadow-sm"
            >
              Images
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              className="rounded-md text-[11px] font-semibold tracking-wide text-stone-300 data-[state=active]:bg-stone-700 data-[state=active]:text-stone-50 data-[state=active]:shadow-sm"
            >
              Layers
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="rounded-md text-[11px] font-semibold tracking-wide text-stone-300 data-[state=active]:bg-stone-700 data-[state=active]:text-stone-50 data-[state=active]:shadow-sm"
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
