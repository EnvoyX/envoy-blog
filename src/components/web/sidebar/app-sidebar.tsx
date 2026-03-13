"use client"

import {
    BookIcon,
    BookmarkIcon,
    Compass,
    Import,
    Newspaper,
    UserIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Link, linkOptions } from "@tanstack/react-router"
import { NavPrimary } from "./nav-primary"
import { NavUser } from "./nav-user"
import { NavPrimaryProps } from "@/lib/types"
import { UserSession } from "@/data/session"

const navItems: NavPrimaryProps["items"] = linkOptions([
    {
        title: "Profile",
        icon: UserIcon,
        to: "/dashboard/profile",
        activeOptions: {
            exact: false
        }
    },
    {
        title: "Diaries",
        icon: BookIcon,
        to: "/dashboard/diaries",
        activeOptions: {
            exact: false
        }
    },
    {
        title: "Blogs",
        icon: Newspaper,
        to: "/dashboard/blog",
        activeOptions: {
            exact: false
        }
    },
    {
        title: "Items",
        icon: BookmarkIcon,
        to: "/dashboard/items",
        activeOptions: {
            exact: false
        }
    },
    {
        title: "Import",
        icon: Import,
        to: "/dashboard/import",
        activeOptions: {
            exact: false
        }
    },
    {
        title: "Discover",
        icon: Compass,
        to: "/dashboard/discover",
        activeOptions: {
            exact: false
        }
    }
])

export function AppSidebar({ user }: UserSession) {
    return (
        <Sidebar collapsible="icon" >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton size="lg" asChild>
                        <Link to="/" className="flex items-center">
                            <div className="flex items-center justify-center aspect-square size-8">
                                <img src="https://tanstack.com/images/logos/logo-color-600.png" alt="TanStack Logo" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="font-bold">Envoy Mindpalace</span>
                                <span className="text-xs">TanStack Ecosystem Playground</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavPrimary items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
