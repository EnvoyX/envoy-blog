import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  MessageSquare,
  Trash2,
  Edit2,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateChatTitleFn, deleteChatFn } from '@/data/chat-ai'
// import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Chat } from '@/generated/prisma/client'
import { modelMessageSchema } from 'ai'

export function ChatItem({ chat }: { chat: Chat }) {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState(chat.title || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const navigate = useNavigate()

  const updateMutation = useMutation({
    mutationFn: updateChatTitleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Updated chat successfully!')
      setIsEditDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChatFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      navigate({
        to: '/chat/$adapter',
        params: {
          adapter: 'openrouter',
        },
      })
      toast.success('Delete chat successfully!')
    },
  })

  return (
    <div className="group relative">
      <Link
        to="/chat/$adapter/$chatId"
        params={{ chatId: chat.id, adapter: chat.model as string }}
        search={{
          model: chat.recentModel ?? '',
        }}
        activeProps={{ className: 'bg-zinc-800/50 border-zinc-700 text-white' }}
        className="flex items-center justify-between gap-2 px-3 py-0 rounded-lg text-sm text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 transition-all border border-transparent"
      >
        <div className="flex items-center gap-3 truncate">
          <MessageSquare size={14} className="shrink-0 text-zinc-600" />
          <span className="truncate">{chat.title || 'Untitled Chat'}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* <span className="text-[10px] text-zinc-600 group-hover:hidden">
            {formatDistanceToNow(new Date(chat.createdAt), {
              addSuffix: false,
            })}
          </span> */}

          <DropdownMenu open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  setIsEditDialogOpen((prev) => !prev)
                }}
              >
                <Edit2 size={12} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault()
                  setIsDeleteDialogOpen((prev) => !prev)
                }}
              >
                <Trash2 size={12} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {/* <DialogTrigger asChild>
              <button
                onClick={(e) => e.preventDefault()} // prevent Link navigation
                className="hidden group-hover:block p-1 hover:text-emerald-400 transition-colors"
              >
                <Edit2 size={12} />
              </button>
            </DialogTrigger> */}
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Rename Chat</DialogTitle>
              </DialogHeader>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800"
              />
              <DialogFooter>
                <Button
                  onClick={() =>
                    updateMutation.mutate({
                      data: { chatId: chat.id, title: newTitle },
                    })
                  }
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            {/* <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.preventDefault()}
                className="hidden group-hover:block p-1 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </AlertDialogTrigger> */}
            <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This will permanently delete the chat and all associated
                  messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() =>
                    deleteMutation.mutate({
                      data: {
                        chatId: chat.id,
                      },
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
                <AlertDialogCancel className="bg-zinc-900 border-zinc-800">
                  Cancel
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Link>
    </div>
  )
}
