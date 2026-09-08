import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/components/studio/StudioApp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Print Layout Pro" },
      {
        name: "description",
        content: "Arrange images on printable paper sizes and export print-ready PDFs.",
      },
    ],
  }),
});

function Index() {
  return <StudioApp />;
}
