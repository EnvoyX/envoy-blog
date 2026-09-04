import { Link } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserSession } from "@/data/session";

import { navItemsDashboard, navSecondayItems } from "../NavItems";
import { NavPrimary } from "./nav-primary";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

export function AppSidebar({ user }: UserSession) {
  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="h-full! transition-transform! duration-500 border-l border-white/25"
    >
      <SidebarHeader>
        <SidebarMenu className="rounded-lg">
          <SidebarMenuButton size="lg" asChild className="">
            <Link to="/" className="flex items-center hover:bg-sidebar-accent! font-mono">
              <div className="flex items-center justify-center aspect-square size-8">
                <img
                  src="https://tanstack.com/images/logos/logo-color-600.png"
                  alt="TanStack Logo"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-bold">Envoy Mindpalace</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="font-mono">
        <NavPrimary items={navItemsDashboard} user={user} />
        <NavSecondary items={navSecondayItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="font-mono">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
