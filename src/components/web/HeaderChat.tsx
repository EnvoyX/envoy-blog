import { getUser } from '@/data/session'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Loader2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { sidebarNavItems } from './NavItems'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { UserAvatar } from './user-profile'
import { useSidebarMobileStore } from '@/store/sidebar'
import { SidebarTrigger } from '../ui/sidebar'

export default function HeaderChat({ model }: { model: string }) {
  const session = useQuery({
    queryKey: ['get-session'],
    queryFn: async () => {
      const data = await getUser()
      return data
    },
  })
  const { toggleMobileSidebar } = useSidebarMobileStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isTransition, startTransition] = useTransition()
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
    <header className="sticky top-0 z-10 border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-xl p-4">
      <main className="w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-4 max-sm:hidden">
            <SidebarTrigger className="text-zinc-400" />
          </div>
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
              <Menu className="size-6 text-primary" />
            </Button>
          </div>
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="font-bold tracking-tight text-lg">Envoy Chat</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {model}
        </div>
        <div className="flex items-center justify-between gap-4 max-sm:hidden">
          {session.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : session?.data?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <UserAvatar
                    src={session.data?.user.image as string}
                    alt={session.data?.user.name as string}
                    className="w-12 h-12 border-2 border-primary/50 hover:ring-2 ring-primary transition-all"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/25 backdrop-blur-xl border-white/25 "
                >
                  <div className="p-2 px-3">
                    <p className="text-sm font-medium truncate">
                      {session.data?.user.name}
                    </p>
                    <p className="text-xs text-accent-foreground truncate">
                      {session.data.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {sidebarNavItems.map((item, idx) => {
                    return (
                      <DropdownMenuItem asChild key={idx}>
                        <Link
                          to={item.to}
                          activeProps={{
                            'data-active': true,
                          }}
                          activeOptions={item.activeOptions}
                          className="cursor-pointer hover:bg-primary/10! hover:text-primary! hover:border-r-2! hover:border-primary!"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading || isTransition}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="text-white mr-2 size-4" />
                    {isLoading || isTransition ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </main>
    </header>
  )
}
