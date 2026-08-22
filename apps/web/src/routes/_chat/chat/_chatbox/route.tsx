import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { Plus, Search, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { ChatItem } from '@/components/ai-elements/ChatItem';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatAppSidebar } from '@/components/web/sidebar/chat-app-sidebar';
import { UserAvatar } from '@/components/web/user-profile';
import { getChatListFn } from '@/data/chat-ai';
import { authClient } from '@/lib/auth-client';
import { MODEL_CONFIG } from '@/lib/constants';
import { useSidebarMobileStore } from '@/store/sidebar';

export const Route = createFileRoute('/_chat/chat/_chatbox')({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (!context?.user)
      throw redirect({
        to: '/login',
      });
    return {
      session: {
        user: context?.user,
      },
    };
  },
});

function RouteComponent() {
  const { session } = Route.useLoaderData();
  const { isSidebarMobileOpen, toggleSheet } = useSidebarMobileStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransition, startTransition] = useTransition();
  const [query, setQuery] = useState<string>('');

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const chats = await getChatListFn();

      return chats;
    },
  });

  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      setQuery(searchTerm);
    },
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  );
  const handleLogout = () => {
    setIsLoading(true);
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading('Logging out...', {
              id: 'logout',
            });
            setIsLoading(true);
          },
          onError: ({ error }) => {
            setIsLoading(false);
            toast.dismiss('logout');
            toast.error('Failed to log out', {
              description: error.message,
            });
          },
          onSuccess: () => {
            setIsLoading(false);
            toast.dismiss('logout');
            toast.success('Logged out successfully');
            void navigate({
              to: '/login',
              reloadDocument: true,
            });
          },
        },
      });
    });
  };
  const filteredChats = chats?.filter((chat) => {
    const matchedQuery = chat.title?.toLowerCase().includes(query.toLowerCase());

    return matchedQuery;
  });

  return (
    <SidebarProvider>
      {/* sidebar */}
      {chats && <ChatAppSidebar chats={chats} />}

      {/* main content */}
      <SidebarInset>
        <main className="flex h-screen overflow-hidden bg-[#09090b] text-slate-50">
          <section className="relative flex-1 flex flex-col min-w-0">
            <Outlet />
          </section>

          <Sheet open={isSidebarMobileOpen} onOpenChange={(open) => toggleSheet(!open)}>
            <SheetContent
              side="left"
              className="w-75 bg-transparent! backdrop-blur-2xl border-l border-white/10 p-0 flex flex-col"
            >
              <SheetHeader className="p-6 text-left border-b border-white/5 flex flex-col gap-4">
                <SheetTitle>
                  <Link to="/" className="flex items-center gap-2 cursor-pointer ">
                    <img
                      src="https://tanstack.com/images/logos/logo-color-banner-600.png"
                      className="size-8"
                      alt="Logo"
                    />
                    <span className="font-bold tracking-tight">Envoy Mindpalace</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4 -mt-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-2 justify-center py-3 px-4 rounded-xl bg-emerald-500 text-emerald-950 active:bg-emerald-300 transition-colors font-semibold text-sm shadow-lg shadow-white/5">
                      <Plus size={18} />
                      New Chat
                      <ChevronDown size={14} className="ml-1 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="bottom"
                    align="center"
                    className="w-[calc(100vw-2rem)] max-w-xs bg-zinc-950 border-zinc-800 text-zinc-200 p-2"
                  >
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs text-zinc-500 py-3">
                      <Sparkles size={14} className="text-emerald-500" />
                      Choose a model to start
                    </DropdownMenuLabel>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {Object.entries(MODEL_CONFIG).map(([provider, models]) => (
                        <div key={provider} className="mb-2">
                          <div className="px-2 py-2 text-[10px] font-black uppercase text-zinc-600 tracking-widest border-b border-white/5 mb-1">
                            {provider}
                          </div>
                          {models.map((m) => (
                            <DropdownMenuItem
                              key={m.value}
                              className="cursor-pointer py-3 px-3 focus:bg-zinc-900 focus:text-white rounded-lg transition-colors"
                              onClick={() => {
                                void navigate({
                                  to: '/chat/$adapter',
                                  params: {
                                    adapter: provider,
                                  },
                                  search: {
                                    model: m.value,
                                  },
                                });
                                if (typeof toggleSheet === 'function') toggleSheet(false);
                              }}
                            >
                              <span className="truncate text-sm font-medium">{m.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="relative group">
                  <Search className="absolute left-3 top-3 size-4 text-zinc-500 transition-colors" />
                  <input
                    placeholder="Search chats..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 ring-white/10 transition-all placeholder:text-zinc-600"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>

              <p className="px-3 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Recent Chats
              </p>
              <div className="flex-1 overflow-y-auto px-2 custom-scrollbar ">
                {filteredChats?.map((chat) => {
                  return <ChatItem key={chat.id} chat={chat} />;
                })}
              </div>

              <div className="p-4 border-t border-zinc-800/50 flex flex-col gap-2">
                {session.user && (
                  <div className="flex items-center gap-3 px-2 py-4 rounded-xl bg-white/5 border border-white/5">
                    <UserAvatar
                      src={session.user.image as string}
                      alt={session.user.name as string}
                      className="w-12 h-12"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate">{session.user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                )}
                {session.user ? (
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                    disabled={isLoading || isTransition}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                ) : (
                  <SheetClose asChild>
                    <Link to="/login" className={buttonVariants({ className: 'w-full' })}>
                      Login
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
