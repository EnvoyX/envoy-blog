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
import { useRef, useState } from 'react'
import { useDebouncedCallback } from '@tanstack/react-pacer'
import { useVirtualizer } from '@tanstack/react-virtual'

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

  //  const multiplyChats = [...filteredChats, ...filteredChats, ...filteredChats]
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredChats.length,
    // count: multiplyChats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Height of each SidebarMenuItem
    overscan: 5,
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
            <div
              ref={parentRef}
              className="flex-1 overflow-y-auto px-2 custom-scrollbar "
            >
              {isLoadingChats ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="size-4 animate-spin text-zinc-500" />
                </div>
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const chat = filteredChats[virtualRow.index]
                    // const chat = multiplyChats[virtualRow.index]
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <ChatItem chat={chat} />
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          <span>Toggle Sidebar</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
            <span className="text-xs">CTRL + B</span>
          </kbd>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
