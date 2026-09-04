import { Link, useNavigate } from '@tanstack/react-router';
import { LogOut, Menu } from 'lucide-react';
import { useMotionValueEvent, useScroll, motion } from 'motion/react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  // SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { User } from '@/generated/prisma/client';
import { authClient } from '@/lib/auth-client';

import { Button, buttonVariants } from '../ui/button';
import { navItemsDashboard, navItemsMain } from './NavItems';
import { UserAvatar } from './user-profile';

export function Navbar({ user }: { user: User | null }) {
  const [hidden, setHidden] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransition, startTransition] = useTransition();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current > previous && current > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });
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
  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-white/25 bg-transparent backdrop-blur"
      animate={{
        y: hidden ? -140 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-3 text-sm font-medium rounded-lg transition-colors"
        >
          <img
            src="/tanstack-emblem-white@2x.png"
            alt="TanStack Start logo"
            className="size-12 object-contain"
          />
        </Link>
        <ul className="hidden sm:flex items-center gap-3 font-bold font-mono">
          {navItemsMain.map((item, index) => {
            // If the menu items can be reordered, don't use index but unique value for
            // for the key
            return (
              <Link
                to={item.to}
                activeProps={{
                  className: 'bg-primary/10 text-primary border-b-2 border-primary',
                }}
                activeOptions={item.activeOptions}
                key={index}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/10"
              >
                {item.title}
              </Link>
            );
          })}
        </ul>

        <div className="hidden sm:flex items-center gap-3">
          {/*<ThemeToggle />*/}
          <div className="flex items-center justify-between gap-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <UserAvatar
                      src={user.image as string}
                      alt={user.name as string}
                      className="w-12 h-12 border-2 border-primary/50 hover:ring-2 ring-primary transition-all"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-background/25 backdrop-blur-xl border-white/25 font-mono"
                  >
                    <div className="p-2 px-3">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-accent-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {navItemsDashboard.map((item, idx) => {
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
                      );
                    })}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoading || isTransition}
                      className="text-destructive focus:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="text-destructive mr-2 size-4" />
                      {isLoading || isTransition ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: 'default', className: 'font-mono' })}
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
            className="w-75 bg-transparent! backdrop-blur-2xl border-l border-white/10 p-0 flex flex-col font-mono"
          >
            <SheetHeader className="p-6 text-left border-b border-white/5">
              <SheetTitle className="flex items-center gap-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 text-sm font-medium rounded-lg transition-colors"
                >
                  <img
                    src="/tanstack-emblem-white@2x.png"
                    alt="TanStack Start logo"
                    className="size-8 object-contain"
                  />
                  <span className="font-bold tracking-tight">Envoy Mindpalace</span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
              {user && (
                <div className="flex items-center gap-3 px-2 py-4 rounded-xl bg-white/5 border border-white/5">
                  <UserAvatar
                    src={user.image as string}
                    alt={user.name as string}
                    className="w-12 h-12"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Main Menu
                </p>
                <div className="grid gap-1">
                  {navItemsMain.map((item, idx) => (
                    <SheetClose key={idx} asChild>
                      <Link
                        to={item.to}
                        activeProps={{
                          className: 'bg-primary/10 text-primary border-r-2 border-primary',
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
                      >
                        {item.title}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {user && (
                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Dashboard
                  </p>
                  <div className="grid gap-1">
                    {user &&
                      navItemsDashboard.map((item, idx) => (
                        <SheetClose key={idx} asChild>
                          <Link
                            to={item.to}
                            activeProps={{
                              className: 'bg-primary/10 text-primary border-r-2 border-primary',
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
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/2">
              {user ? (
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
      </div>
    </motion.nav>
  );
}
