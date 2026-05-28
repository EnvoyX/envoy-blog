import { createFileRoute } from "@tanstack/react-router";
import { FolderIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlbumCard } from "@/components/web/album/AlbumCard";
import { useAlbumStore } from "@/store/album";
import { dashboardAlbumsOptions } from "@/data/query-options/dashboardQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/albums/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(dashboardAlbumsOptions());
  },
  head: () => ({
    meta: [
      { title: `My Albums | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: "My Albums | Envoy Mindpalace" },
      {
        property: "og:description",
        content: "Create your own blog and write your thoughts!",
      },
      {
        property: "og:image",
        content: "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function RouteComponent() {
  const { data: albums } = useSuspenseQuery({
    ...dashboardAlbumsOptions(),
  });
  const { setInitialValues, toggleDialog } = useAlbumStore();
  return (
    <div className="min-h-screen p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-1">
          <h2 className="text-4xl font-black tracking-tight text-white">Your Albums</h2>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
            onClick={() => {
              toggleDialog("open", "");
              setInitialValues({
                coverImageUrl: "https://tanstack.com/images/logos/splash-dark.png",
                description: "",
                name: "",
                published: false,
                type: "create",
                showPrivateToFollowers: false,
              });
            }}
          >
            <div className="flex items-center gap-2">
              <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold tracking-tight">New Album </span>
            </div>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} inDashboard={true} />
          ))}
          <button
            className="group flex flex-col gap-3 items-center justify-start text-left cursor-pointer"
            onClick={() => {
              toggleDialog("open", "");
              setInitialValues({
                coverImageUrl: "https://tanstack.com/images/logos/splash-dark.png",
                description: "",
                name: "",
                published: false,
                type: "create",
                showPrivateToFollowers: false,
              });
            }}
          >
            <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-emerald-800 flex items-center justify-center bg-transparent group-hover:bg-slate-900/50 group-hover:border-emerald-500 transition-all cursor-pointer">
              <button className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="size-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-colors">
                  <FolderIcon className="size-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-slate-400">
                  New Album
                </span>
              </button>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
