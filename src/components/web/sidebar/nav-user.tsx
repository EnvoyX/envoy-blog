import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react"
import { Suspense, useTransition } from "react"
import { toast } from "sonner"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { data, isPending } = authClient.useSession()
    const navigate = useNavigate()
    const [isTransition, startTransition] = useTransition()
    const handleLogout = () => {
        startTransition(async () => {
            await authClient.signOut({
                fetchOptions: {
                    onRequest: () => {
                        toast.loading("Logging out...", {
                            id: "logout"
                        })
                    },
                    onError: ({ error }) => {
                        toast.dismiss("logout")
                        toast.error("Failed to log out", {
                            description: error.message
                        });
                    },
                    onSuccess: () => {
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
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={data?.user.image as string} alt={data?.user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {data?.user?.name?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <Suspense fallback={
                                    <Skeleton className="w-12 h-2" />
                                }>
                                    <span className="truncate font-medium">{data?.user.name}</span>
                                </Suspense>
                                <Suspense fallback={
                                    <Skeleton className="w-12 h-1" />
                                }>
                                    <span className="truncate text-xs">{data?.user.email}</span>
                                </Suspense>
                            </div>
                            <ChevronsUpDownIcon className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={data?.user.image as string} alt={data?.user.name} />
                                    <AvatarFallback className="rounded-lg">{data?.user?.name?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{data?.user.name}</span>
                                    <span className="truncate text-xs">{data?.user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/profile" activeProps={
                                    {
                                        "data-active": true
                                    }
                                } activeOptions={{
                                    exact: false
                                }}>
                                    <UserIcon
                                    />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={isTransition || isPending}>
                            <LogOutIcon
                            />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
