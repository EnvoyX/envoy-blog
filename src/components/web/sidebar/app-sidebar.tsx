import { Link } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { UserSession } from '@/data/session';

import { navItemsDashboard } from '../NavItems';
import { NavPrimary } from './nav-primary';
import { NavUser } from './nav-user';

export function AppSidebar({ user }: UserSession) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-emerald-950/50!">
      <SidebarHeader className="bg-emerald-950/50!">
        <SidebarMenu className="bg-emerald-950/50! rounded-lg">
          <SidebarMenuButton size="lg" asChild className="">
            <Link to="/" className="flex items-center hover:bg-emerald-500/30! ">
              <div className="flex items-center justify-center aspect-square size-8">
                <img
                  src="https://tanstack.com/images/logos/logo-color-600.png"
                  alt="TanStack Logo"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-bold">Envoy Mindpalace</span>
                <span className="text-xs">TanStack Ecosystem Playground</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-emerald-950/50!">
        <NavPrimary items={navItemsDashboard} user={user} />
      </SidebarContent>
      <SidebarFooter className="bg-emerald-950/50!">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
