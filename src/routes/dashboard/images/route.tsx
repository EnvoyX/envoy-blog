import { ImportToAlbumModal } from "@/components/web/image/ImportToAlbumModal";
import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/images")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <ImportToAlbumModal />
    </>
  );
}
