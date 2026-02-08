"use client"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { NavPrimaryProps } from "@/lib/types"

export function NavPrimary({ items }: NavPrimaryProps) {

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item, index) => {
                        // If the menu items can be reordered, don't use index but unique value for
                        // for the key
                        return (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuButton asChild size="sm">
                                    <Link to={item.to} activeProps={{
                                        "data-active": true
                                    }} activeOptions={item.activeOptions} >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
