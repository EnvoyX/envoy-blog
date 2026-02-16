import { Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { LayoutDashboard, Loader2, LogOut, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from './user-profile'

export function Navbar() {
    const session = authClient.useSession()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [isTransition, startTransition] = useTransition()
    const handleLogout = () => {
        setIsLoading(true);
        startTransition(async () => {
            await authClient.signOut({
                fetchOptions: {
                    onRequest: () => {
                        toast.loading("Logging out...", {
                            id: "logout"
                        })
                        setIsLoading(true);
                    },
                    onError: ({ error }) => {
                        setIsLoading(false);
                        toast.dismiss("logout")
                        toast.error("Failed to log out", {
                            description: error.message
                        });
                    },
                    onSuccess: () => {
                        setIsLoading(false);
                        toast.dismiss("logout")
                        toast.success("Logged out successfully");
                        navigate({
                            to: "/login"
                        })
                    }
                }
            });
        })
    };

    return (
        <nav className="sticky top-0 z-50 border-b bg-transparent backdrop-blur">
            <div className="mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="https://tanstack.com/images/logos/logo-color-banner-600.png"
                        alt="TanStack Start logo"
                        className="size-12"
                    />
                    <h1 className="text-lg font-bold text-white">Envoy Mindpalace</h1>
                </Link>
                <div className="flex items-center gap-3">
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
                                        className="w-56 bg-background/25 backdrop-glass-xl border-white/25 hidden md:block"
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
                                                <LayoutDashboard className="text-white mr-2 size-4" />{" "}
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/dashboard/profile"
                                                className="cursor-pointer hover:bg-white/15!"
                                            >
                                                <User className="text-white mr-2 size-4" />{" "}
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            disabled={isLoading || isTransition}
                                            className="text-destructive focus:bg-destructive/10 cursor-pointer"
                                        >
                                            <LogOut className="text-white mr-2 size-4" />
                                            {isLoading || isTransition
                                                ? "Logging out..."
                                                : "Logout"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className={`md:hidden ${isLoading ? "cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                    disabled={isLoading || isTransition}
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    {isLoading || isTransition ? (
                                        <div className="flex">
                                            <Loader2 className="animate-spin size-5" />
                                        </div>
                                    ) : (
                                        "Log Out"
                                    )}
                                </Button>
                            </>) : (
                            <>
                                <Link to="/login" className={buttonVariants({ variant: "secondary" })}>Login</Link>
                                <Link to="/signup" className={buttonVariants({ variant: "default" })}>Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
