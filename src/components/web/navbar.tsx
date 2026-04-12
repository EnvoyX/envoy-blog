import { Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
// import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { LayoutDashboard, Loader2, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from './user-profile'
import { useQuery } from '@tanstack/react-query'
import { linkOptions } from '@tanstack/react-router'
import { NavProps } from '@/lib/types'

export function Navbar() {
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const data = await authClient.getSession()
      return data.data
    },
  })
  const [menuState, setMenuState] = useState(false)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isTransition, startTransition] = useTransition()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
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

  const closeMenu = () => setMenuState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuState &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuState])

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-transparent backdrop-blur"
      ref={navRef}
      data-state={menuState && 'active'}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
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
                  'data-active': true,
                }}
                activeOptions={item.activeOptions}
                key={index}
                className="hover:scale-105 hover:underline transition-transform"
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
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className="cursor-pointer hover:bg-white/15!"
                      >
                        <LayoutDashboard className="text-white mr-2 size-4" />{' '}
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard/profile"
                        className="cursor-pointer hover:bg-white/15!"
                      >
                        <User className="text-white mr-2 size-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
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
      </div>
    </nav>
  )
}
