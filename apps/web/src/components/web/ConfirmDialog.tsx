import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { removeFollowerFn } from '@/data/follow';
import { followDialogStore } from '@/store/profile';
export default function ConfirmDialog() {
  const { isConfirmDialogOpen, confirmData, currentUserId, isLoading } =
    useSelector(followDialogStore);
  const queryClient = useQueryClient();
  async function handleRemoveFollower() {
    followDialogStore.setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    await removeFollowerFn({
      data: {
        followId: confirmData.followId,
        followerId: confirmData.followerId,
      },
    });
    toast.success('Follower successfully removed');
    void queryClient.invalidateQueries({
      queryKey: ['user-following-followers', currentUserId],
    });
    void queryClient.invalidateQueries({
      queryKey: ['followsData'],
    });
    followDialogStore.setState((prev) => ({
      ...prev,
      isConfirmDialogOpen: false,
      isLoading: false,
    }));
  }

  return (
    <Dialog
      open={isConfirmDialogOpen}
      onOpenChange={(open) => {
        if (isLoading) return;
        followDialogStore.setState((prev) => ({
          ...prev,
          isConfirmDialogOpen: open,
          isLoading: false,
        }));
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Follower</DialogTitle>
          <DialogDescription>Are you sure you want to remove this follower?</DialogDescription>
          <section className="flex flex-col items-center my-2 space-y-0">
            <img
              src={confirmData.followerImage}
              alt={confirmData.followerName}
              className="w-32 h-32 rounded-full mx-auto"
            />
            <h2 className="text-center text-lg">{confirmData.followerName}</h2>
            <h3 className="text-center text-sm text-muted-foreground">
              {confirmData.followerEmail}
            </h3>
          </section>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:justify-center sm:flex-row">
          <Button
            type="button"
            disabled={isLoading}
            variant={'destructive'}
            className="cursor-pointer"
            onClick={handleRemoveFollower}
          >
            {isLoading ? <Loader2 className="animate-spin size-4" /> : <span>Remove Follower</span>}
          </Button>
          <DialogClose asChild>
            <Button disabled={isLoading} type="button" className="cursor-pointer">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
