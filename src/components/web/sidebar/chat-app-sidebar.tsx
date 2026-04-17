// components/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Loader2, Plus, Search } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ChatItem } from '@/components/ai-elements/ChatItem'
import { Chat } from '@/generated/prisma/client'
import { useState } from 'react'
import { useDebouncedCallback } from '@tanstack/react-pacer'

export function ChatAppSidebar({
  chats,
  isLoadingChats,
  ...props
}: { chats: Chat[]; isLoadingChats: boolean } & React.ComponentProps<
  typeof Sidebar
>) {
  const navigate = useNavigate()
  const [query, setQuery] = useState<string>('')
  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      setQuery(searchTerm)
    },
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  )

  const filteredChats = chats.filter((chat) => {
    const matchedQuery = chat.title?.toLowerCase().includes(query.toLowerCase())

    return matchedQuery
  })

  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      {...props}
      className="border-r border-zinc-800/50"
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              variant={'default'}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-400 transition-colors cursor-pointer"
              onClick={() => navigate({ to: '/chat' })}
            >
              <Plus className="size-4" />
              <span className="font-semibold">New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 size-4 text-zinc-500" />
          <input
            placeholder="Search..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-2 pl-8 text-xs focus:outline-none"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {isLoadingChats ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                filteredChats?.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatItem chat={chat} />
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="p-4 border-t border-zinc-800/50"> */}
      {/* Your Profile / Logout logic here */}
      {/* </SidebarFooter> */}
    </Sidebar>
  )
}
