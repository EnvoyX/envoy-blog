import { Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
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
import { authClient } from '@/lib/auth-client'
import {
  BookMarkedIcon,
  BookmarkIcon,
  Check,
  Compass,
  Import,
  LayoutDashboardIcon,
  Loader2,
  LogOut,
  Menu,
  Newspaper,
  UserIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from './user-profile'
import { useQuery } from '@tanstack/react-query'
import { linkOptions } from '@tanstack/react-router'
import { NavPrimaryProps, NavProps } from '@/lib/types'

export function Navbar() {
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const data = await authClient.getSession()
      return data.data
    },
  })
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

  const navItems: NavProps['items'] = linkOptions([
    {
      title: 'Blog',
      to: '/blog',
      activeOptions: {
        exact: false,
      },
    },
  ])

  const sidebarNavItems: NavPrimaryProps['items'] = linkOptions([
    {
      title: 'Dashboard',
      icon: LayoutDashboardIcon,
      to: '/dashboard',
      activeOptions: {
        exact: true,
      },
    },
    {
      title: 'Profile',
      icon: UserIcon,
      to: '/dashboard/profile',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Task Tracker',
      icon: Check,
      to: '/dashboard/task-tracker',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: "Qur'an Tracker",
      icon: BookMarkedIcon,
      to: '/dashboard/quran-tracker',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Blogs',
      icon: Newspaper,
      to: '/dashboard/blog',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Items',
      icon: BookmarkIcon,
      to: '/dashboard/items',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Import',
      icon: Import,
      to: '/dashboard/import',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Discover',
      icon: Compass,
      to: '/dashboard/discover',
      activeOptions: {
        exact: false,
      },
    },
  ])

  return (
    <nav className="sticky top-0 z-50 border-b bg-transparent backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          activeProps={{
            className: 'bg-primary/10 text-primary border-b-2 border-primary',
          }}
          className="flex items-center gap-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/10"
        >
          <img
            src="https://tanstack.com/images/logos/logo-color-banner-600.png"
            alt="TanStack Start logo"
            className="size-12"
          />
        </Link>
        <ul className="hidden sm:flex items-center gap-3 font-bold ">
          {navItems.map((item, index) => {
            // If the menu items can be reordered, don't use index but unique value for
            // for the key
            return (
              <Link
                to={item.to}
                activeProps={{
                  className:
                    'bg-primary/10 text-primary border-b-2 border-primary',
                }}
                activeOptions={item.activeOptions}
                key={index}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/10"
              >
                {item.title}
              </Link>
            )
          })}
        </ul>

        <div className="hidden sm:flex items-center gap-3">
          {/*<ThemeToggle />*/}
          <div className="flex items-center justify-between gap-4">
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
                    {sidebarNavItems.map((item) => {
                      return (
                        <DropdownMenuItem asChild>
                          <Link
                            to={item.to}
                            activeProps={{
                              'data-active': true,
                            }}
                            activeOptions={item.activeOptions}
                            className="cursor-pointer"
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
        </div>

        {/* Mobile Navbar */}
        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="size-6 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
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

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
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

              <div className="space-y-1">
                <p className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Main Menu
                </p>
                <div className="grid gap-1">
                  {navItems.map((item, idx) => (
                    <SheetClose key={idx} asChild>
                      <Link
                        to={item.to}
                        activeProps={{
                          className:
                            'bg-primary/10 text-primary border-r-2 border-primary',
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
                      >
                        {item.title}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Dashboard
                </p>
                <div className="grid gap-1">
                  {sidebarNavItems.map((item, idx) => (
                    <SheetClose key={idx} asChild>
                      <Link
                        to={item.to}
                        activeProps={{
                          className:
                            'bg-primary/10 text-primary border-r-2 border-primary',
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
                      >
                        <item.icon className="size-4" />
                        {item.title}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/2">
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
      </div>
    </nav>
  )
}
