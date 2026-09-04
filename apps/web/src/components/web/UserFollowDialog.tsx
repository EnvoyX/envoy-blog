import { createId } from '@paralleldrive/cuid2';
import { VirtualOrigin } from '@tanstack/react-db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { Loader2, MoreHorizontal, UserX } from 'lucide-react';
import { match } from 'ts-pattern';
import { useMediaQuery } from 'usehooks-ts';

import { followColection } from '@/collections/follow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFollowsByUserIdFn } from '@/data/follow';
import { UserRole } from '@/generated/prisma/enums';
import { followDialogStore } from '@/store/profile';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
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
          currentUserId: '',
        }));
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800">
        <DialogHeader className="p-4 border-b border-zinc-900">
          <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest text-foreground">
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-zinc-900 px-2 h-12">
            <TabsTrigger
              value="followers"
              className="flex-1 h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs font-bold cursor-pointer rounded-lg"
            >
              {follows.filter((follow) => follow.followingId === currentUserId).length} Followers
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs font-bold cursor-pointer rounded-lg"
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
  type: 'followers' | 'following';
  currentUserId: string;
} & FollowDialogProps) {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { data, isLoading } = useQuery({
    queryKey: ['user-following-followers', currentUserId],
    queryFn: async () => {
      const user = await getFollowsByUserIdFn({ data: { userId: currentUserId } });
      return {
        followers: user.followers?.map((user) => user.follower),
        following: user.following?.map((user) => user.following),
      };
    },
    enabled: currentUserId ? true : false,
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
    } else {
      // optimistic delete follow
      followColection.delete(existingFollow.id);
    }
    void queryClient.invalidateQueries({
      queryKey: ['user-following-followers', currentUserId],
    });
    void queryClient.invalidateQueries({
      queryKey: ['followsData'],
    });
  }

  function getUsersByType(type: 'followers' | 'following') {
    if (type === 'followers') {
      const users = data?.followers;
      return users;
    } else {
      const users = data?.following;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-12">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {users?.map((user) => {
        const hasFollowed = follows.find(
          (follow) => follow.followerId === session?.user?.id && follow.followingId === user.id,
        );
        const followerData = follows.find(
          (follow) => follow.followerId === user.id && follow.followingId === session?.user?.id,
        );
        return (
          <Link
            to={'/user/$userId'}
            params={{
              userId: user.id,
            }}
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-slate-900/50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer"
            onClick={() =>
              followDialogStore.setState((prev) => ({ ...prev, isOpen: false, currentUserId: '' }))
            }
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-slate-800">
                <AvatarImage src={user.image as string} />
                <AvatarFallback>
                  {(user.name as string)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user.name}</span>
                <span className="text-xs text-slate-500 max-w-xs">{user.biodata || ''}</span>
              </div>
            </div>
            {session.user && session.user?.id !== user.id && (
              <div className="flex items-center gap-3 ">
                {hasFollowed ? (
                  <Button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleFollow(user.id);
                    }}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleFollow(user.id);
                    }}
                  >
                    Follow
                  </Button>
                )}{' '}
                {session.user.id === currentUserId && (
                  <section
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {type === 'followers' &&
                      match(isMobile)
                        .with(true, () => (
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button variant="ghost" className="cursor-pointer">
                                <MoreHorizontal />
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>{user.name}</DrawerTitle>
                                <DrawerDescription>{user.email}</DrawerDescription>
                              </DrawerHeader>
                              <DrawerFooter>
                                <Button
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    followDialogStore.setState((prev) => ({
                                      ...prev,
                                      isConfirmDialogOpen: true,
                                      confirmData: {
                                        followId: followerData?.id as string,
                                        followerId: user.id,
                                        followerImage: user.image ?? (user.defaultImage as string),
                                        followerName: user.name,
                                        followerEmail: user.email,
                                      },
                                    }));
                                  }}
                                >
                                  Remove this Follower
                                </Button>
                                <DrawerClose>
                                  <Button variant="outline" className="w-full cursor-pointer">
                                    Cancel
                                  </Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        ))
                        .with(false, () => (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="cursor-pointer flex items-center gap-2"
                                  onClick={() => {
                                    followDialogStore.setState((prev) => ({
                                      ...prev,
                                      isConfirmDialogOpen: true,
                                      confirmData: {
                                        followId: followerData?.id as string,
                                        followerId: user.id,
                                        followerImage: user.image ?? (user.defaultImage as string),
                                        followerName: user.name,
                                        followerEmail: user.email,
                                      },
                                    }));
                                  }}
                                >
                                  <UserX />
                                  <span>Remove this Follower</span>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ))
                        .exhaustive()}
                  </section>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
