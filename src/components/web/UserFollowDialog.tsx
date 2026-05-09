import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "@tanstack/react-store";
import { followDialogStore } from "@/store/profile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFollowsByUserIdFn } from "@/data/follow";
import { VirtualOrigin } from "@tanstack/react-db";
import { UserRole } from "@/generated/prisma/enums";
import { followColection } from "@/collections/follow";
import { createId } from "@paralleldrive/cuid2";

type FollowDialogProps = {
  follows: {
    id: string;
    createdAt: Date;
    followerId: string;
    followingId: string;
    readonly $synced: boolean;
    readonly $origin: VirtualOrigin;
    readonly $key: string;
    readonly $collectionId: string;
  }[];
  session: {
    user:
      | {
          id?: string | undefined;
          createdAt?: Date | undefined;
          updatedAt?: Date | undefined;
          email?: string | undefined;
          emailVerified?: boolean | undefined;
          name?: string | undefined;
          image?: string | null | undefined;
          password?: string | null | undefined;
          imageKey?: string | null | undefined;
          defaultImage?: string | null | undefined;
          biodata?: string | null | undefined;
          showFollowStats?: boolean | undefined;
          role?: UserRole | undefined;
        }
      | undefined;
  };
};

export function UserFollowDialog({ follows, session }: FollowDialogProps) {
  const { initialTab, isOpen, currentUserId } = useSelector(followDialogStore);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        followDialogStore.setState((prev) => ({
          ...prev,
          isOpen: open,
          currentUserId: "",
        }));
      }}
    >
      <DialogContent className="sm:max-w-106.25 p-0 gap-0 overflow-hidden bg-slate-950 border-slate-800">
        <DialogHeader className="p-4 border-b border-slate-900">
          <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest text-slate-400">
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-slate-900 p-0 h-12">
            <TabsTrigger
              value="followers"
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 text-xs font-bold"
            >
              {follows.filter((follow) => follow.followingId === currentUserId).length} Followers
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 text-xs font-bold"
            >
              {follows.filter((follow) => follow.followerId === currentUserId).length} Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="m-0 h-100 overflow-y-auto">
            <UserList
              type="followers"
              currentUserId={currentUserId}
              follows={follows}
              session={session}
            />
          </TabsContent>

          <TabsContent value="following" className="m-0 h-100 overflow-y-auto">
            <UserList
              type="following"
              currentUserId={currentUserId}
              follows={follows}
              session={session}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserList({
  type,
  currentUserId,
  follows,
  session,
}: {
  type: "followers" | "following";
  currentUserId: string;
} & FollowDialogProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["user-following-followers"],
    queryFn: async () => {
      const data = await getFollowsByUserIdFn({ data: { userId: currentUserId } });
      return {
        followers: data.followers?.map((follower) => follower.following),
        following: data.following?.map((following) => following.follower),
      };
    },
  });

  function handleToggleFollow(targetUserId: string) {
    if (!session.user) return;
    const existingFollow = follows.find(
      (follow) => follow.followerId === session?.user?.id && follow.followingId === targetUserId,
    );
    if (!existingFollow) {
      // optimistic Insert follow
      followColection.insert({
        id: createId(),
        createdAt: new Date(),
        followingId: targetUserId,
        followerId: session?.user.id as string,
      });
      queryClient.invalidateQueries({
        queryKey: ["user-following-followers"],
      });
    } else {
      // optimistic delete follow
      followColection.delete(existingFollow.id);
      queryClient.invalidateQueries({
        queryKey: ["user-following-followers"],
      });
    }
  }

  function getUsersByType(type: "followers" | "following") {
    if (type === "followers") {
      const users = data?.following;
      return users;
    } else {
      const users = data?.followers;
      return users;
    }
  }

  const users = getUsersByType(type);

  if (users?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
        <p className="text-sm italic">No {type} yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {users?.map((user) => {
        const hasFollowed = follows.find(
          (follow) => follow.followerId === session?.user?.id && follow.followingId === user.id,
        );
        return (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-slate-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-slate-800">
                <AvatarImage src={user.image as string} />
                <AvatarFallback>
                  {(user.name as string)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user.name}</span>
                <span className="text-xs text-slate-500 max-w-xs">{user.biodata || "user"}</span>
              </div>
            </div>
            {hasFollowed ? (
              <Button className="cursor-pointer" onClick={() => handleToggleFollow(user.id)}>
                Unfollow
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={() => handleToggleFollow(user.id)}>
                Follow
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
