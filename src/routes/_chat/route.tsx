import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { Plus, Search, LogOut, Loader2 } from 'lucide-react'
import {
  useQuery,
  useSuspenseQuery,
  // useMutation,
  // useQueryClient,
} from '@tanstack/react-query'
import { getChatListFn } from '@/data/chat-ai'
import { useSidebarMobileStore } from '@/store/sidebar'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button, buttonVariants } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { UserAvatar } from '@/components/web/user-profile'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ChatItem } from '@/components/ai-elements/ChatItem'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChatAppSidebar } from '@/components/web/sidebar/chat-app-sidebar'
import { useDebouncedCallback } from '@tanstack/react-pacer'

export const Route = createFileRoute('/_chat')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isSidebarMobileOpen, toggleSheet } = useSidebarMobileStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isTransition, startTransition] = useTransition()
  const [query, setQuery] = useState<string>('')
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const data = await authClient.getSession()
      return data.data
    },
  })
  const { data: chats, isLoading: isLoadingChats } = useSuspenseQuery({
    queryKey: ['chats'],
    queryFn: () => getChatListFn(),
  })

  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      setQuery(searchTerm)
    },
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  )

  const filteredChats = chats.filter((chat) => {
    const matchedQuery = chat.title?.toLowerCase().includes(query.toLowerCase())

    return matchedQuery
  })

  const handleLogout = () => {
    setIsLoading(true)
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading('Logging out...', {
              id: 'logout',
            })
            setIsLoading(true)
          },
          onError: ({ error }) => {
            setIsLoading(false)
            toast.dismiss('logout')
            toast.error('Failed to log out', {
              description: error.message,
            })
          },
          onSuccess: () => {
            setIsLoading(false)
            toast.dismiss('logout')
            toast.success('Logged out successfully')
            navigate({
              to: '/login',
            })
          },
        },
      })
    })
  }

  return (
    <SidebarProvider>
      {/* sidebar */}
      <ChatAppSidebar chats={chats} isLoadingChats={isLoadingChats} />

      {/* main content */}
      <SidebarInset>
        <main className="flex h-screen overflow-hidden bg-[#09090b] text-slate-50">
          <section className="relative flex-1 flex flex-col min-w-0">
            <Outlet />
          </section>

          <Sheet
            open={isSidebarMobileOpen}
            onOpenChange={(open) => toggleSheet(!open)}
          >
            <SheetContent
              side="left"
              className="w-75 bg-background/95 backdrop-blur-2xl border-l border-white/10 p-0 flex flex-col"
            >
              <SheetHeader className="p-6 text-left border-b border-white/5">
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src="https://tanstack.com/images/logos/logo-color-banner-600.png"
                    className="size-8"
                    alt="Logo"
                  />
                  <span className="font-bold tracking-tight">
                    Envoy Mindpalace
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4">
                <button
                  onClick={() => navigate({ to: '/chat' })}
                  className="w-full flex items-center gap-2 justify-center py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-colors font-medium text-sm"
                >
                  <Plus size={16} />
                  New Chat
                </button>

                <div className="relative group">
                  <Search className="absolute left-3 top-2.5 size-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                  <input
                    placeholder="Search chats..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-zinc-700"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                <p className="px-3 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Recent Chats
                </p>
                {isLoadingChats ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  filteredChats?.map((chat) => <ChatItem chat={chat} />)
                )}
              </div>

              <div className="p-4 border-t border-zinc-800/50 flex flex-col gap-2">
                {session.data?.user && (
                  <div className="flex items-center gap-3 px-2 py-4 rounded-xl bg-white/5 border border-white/5">
                    <UserAvatar
                      src={session.data?.user.image as string}
                      alt={session.data?.user.name as string}
                      className="w-12 h-12"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate">
                        {session.data?.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.data?.user.email}
                      </span>
                    </div>
                  </div>
                )}
                {session.data?.user ? (
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
                    <Link
                      to="/login"
                      className={buttonVariants({ className: 'w-full' })}
                    >
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
  )
}
