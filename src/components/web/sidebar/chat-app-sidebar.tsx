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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronLeft, ChevronRight, Plus, Search, Sparkles } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ChatItem } from '@/components/ai-elements/ChatItem'
import { Chat } from '@/generated/prisma/client'
import { useState } from 'react'
import { useDebouncedCallback } from '@tanstack/react-pacer'
import { MODEL_CONFIG } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function ChatAppSidebar({
  chats,
  ...props
}: { chats: Chat[] } & React.ComponentProps<typeof Sidebar>) {
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer "
                >
                  <Plus className="size-4 " />
                  <span className="font-semibold ">New Chat</span>
                  <ChevronRight className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="start"
                className="w-64 bg-zinc-900 border-zinc-800 text-zinc-200"
              >
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-zinc-500">
                  <Sparkles size={12} className="text-blue-500" />
                  Select a starting model
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                {Object.entries(MODEL_CONFIG).map(([provider, models]) => (
                  <div key={provider}>
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-zinc-600 tracking-widest">
                      {provider}
                    </div>
                    {models.map((m) => (
                      <DropdownMenuItem
                        key={m.value}
                        className="cursor-pointer focus:bg-zinc-900 focus:text-white hover:bg-white/20!"
                        onClick={() => {
                          navigate({
                            to: '/chat/$adapter',
                            params: {
                              adapter: provider,
                            },
                            search: {
                              model: m.value,
                            },
                          })
                        }}
                      >
                        <span className="truncate text-xs">{m.label}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-zinc-800" />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button
          variant={'outline'}
          onClick={() =>
            navigate({
              to: '/',
            })
          }
          className="w-full mt-1 flex items-center cursor-pointer"
        >
          <ChevronLeft className=" size-4" />
          Back to Home
        </Button>
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
            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar ">
              <SidebarMenu className="space-y-1">
                {filteredChats?.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <ChatItem chat={chat} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
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
