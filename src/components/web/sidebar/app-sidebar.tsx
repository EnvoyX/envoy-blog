"use client"

import * as React from "react"
import {
    BookmarkIcon,
    Compass,
    Frame,
    Import,
    Map,
    PieChart,
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

const data = {
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton size="lg" asChild>
                        <Link to="/dashboard" className="flex items-center">
                            <div className="flex items-center justify-center aspect-square size-8">
                                <img src="https://tanstack.com/images/logos/logo-color-600.png" alt="TanStack Logo" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="font-bold">Enlogs</span>
                                <span className="text-xs">My Own Personal Blog</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavPrimary items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
