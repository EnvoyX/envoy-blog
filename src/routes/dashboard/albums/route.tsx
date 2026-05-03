import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlbumDialog } from "@/components/web/album/AlbumDialog";
import { BulkImportDialog } from "@/components/web/album/BulkImportDialog";
import { deleteAlbumFn } from "@/data/album";
import { useAlbumStore } from "@/store/album";
import { useRouter } from "@tanstack/react-router";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/albums")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { toggleDialog, isDeleteDialogOpen, onOpenDialogChange, currentAlbumId } = useAlbumStore();
  async function handleDeleteAlbum() {
    await deleteAlbumFn({
      data: {
        albumId: currentAlbumId,
      },
    });
    toast.success("Album successfully deleted");
    void router.invalidate();
    toggleDialog("close", "");
  }

  return (
    <>
      <Outlet />
      <AlbumDialog />
      <BulkImportDialog />
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          onOpenDialogChange("delete", open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant={"destructive"}
              className="cursor-pointer"
              onClick={handleDeleteAlbum}
            >
              Delete Album
            </Button>
            <DialogClose asChild>
              <Button type="button" className="cursor-pointer">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
