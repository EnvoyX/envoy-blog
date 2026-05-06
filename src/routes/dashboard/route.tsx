import { getUser } from "@/data/session";
// import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/web/sidebar/app-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ImportImageModal } from "@/components/web/image/ImportImageModal";
import { ImportToAlbumModal } from "@/components/web/image/ImportToAlbumModal";
import { ImageDialog } from "@/components/web/image/ImageDialog";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  loader: async () => {
    const session = await getUser();

    return {
      user: session.user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="bg-linear-to-b from-slate-950 to-emerald-500/30 linear text-slate-50 selection:bg-emerald-500/30">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {/*<Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />*/}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-linear-to-b from-slate-950 to-emerald-500/30 linear text-slate-50 selection:bg-emerald-500/30">
          <Outlet />
        </div>
      </SidebarInset>
      <ImportImageModal />
      <ImportToAlbumModal />
      <ImageDialog />
    </SidebarProvider>
  );
}
