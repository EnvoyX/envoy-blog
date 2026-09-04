import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

// import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BulkImageDialog } from '@/components/web/image/BulkImageDialog';
import { EditImagesDialog } from '@/components/web/image/EditImagesDialog';
import { ImageDialog } from '@/components/web/image/ImageDialog';
import { ImportImageModal } from '@/components/web/image/ImportImageModal';
import { ImportToAlbumModal } from '@/components/web/image/ImportToAlbumModal';
import { ImageUploader } from '@/components/web/ImageUploader';
import { AppSidebar } from '@/components/web/sidebar/app-sidebar';
import { useSidebarStore } from '@/store/sidebar';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (!context?.user) throw redirect({ to: '/login' });

    return {
      user: context?.user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();
  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={(open) => toggleSidebar(open)}>
      <AppSidebar user={user} />
      <SidebarInset className="bg-background selection:bg-foreground selection:text-background">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {/*<Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />*/}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-background selection:bg-foreground selection:text-background">
          <div className="min-h-screen bg-background text-foreground">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <ImageUploader />
      <ImportImageModal />
      <ImportToAlbumModal />
      <ImageDialog />
      <BulkImageDialog />
      <EditImagesDialog />
    </SidebarProvider>
  );
}
