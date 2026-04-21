'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserRole } from '@/generated/prisma/enums'
import { allowedRoles } from '@/lib/constants'
import { Link } from '@tanstack/react-router'
import { Key, LucideIcon } from 'lucide-react'

type NavPrimaryProps = {
  items: {
    title: string
    to: string
    icon: LucideIcon
    activeOptions: {
      exact: boolean
    }
  }[]
  user: {
    id?: string | undefined
    email?: string | undefined
    name?: string | undefined
    password?: string | null | undefined
    emailVerified?: boolean | undefined
    image?: string | null | undefined
    defaultImage?: string | null | undefined
    role?: UserRole | undefined
    createdAt?: Date | undefined
    updatedAt?: Date | undefined
  }
}

export function NavPrimary({ items, user }: NavPrimaryProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              {allowedRoles.includes(user.role as string) && (
                <Link
                  to={'/dashboard/admin'}
                  activeProps={{
                    className:
                      'bg-primary/10! text-primary! border-r-2! border-primary!',
                  }}
                  className="flex items-center gap-3! px-3! py-3! text-sm! font-medium! rounded-lg! transition-colors! hover:bg-white/5!"
                  activeOptions={{ exact: false }}
                >
                  <Key />
                  <span>Admin</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {items.map((item, index) => {
            // If the menu items can be reordered, don't use index but unique value for
            // for the key
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild size="sm">
                  <Link
                    to={item.to}
                    activeProps={{
                      className:
                        'bg-primary/10! text-primary! border-r-2! border-primary!',
                    }}
                    className="flex items-center gap-3! px-3! py-3! text-sm! font-medium! rounded-lg! transition-colors! hover:bg-white/5!"
                    activeOptions={item.activeOptions}
                  >
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
