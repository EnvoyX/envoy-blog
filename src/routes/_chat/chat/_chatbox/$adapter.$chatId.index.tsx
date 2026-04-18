import HeaderChat from '@/components/web/HeaderChat'
import { MarkdownRenderer } from '@/components/web/markdown/Markdown'
import { UserAvatar } from '@/components/web/user-profile'
import { getChatHistoryFn, saveAssistantMessageFn } from '@/data/chat-ai'
import { getUser } from '@/data/session'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Bot, Loader, Loader2, Send, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_chat/chat/_chatbox/$adapter/$chatId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { adapter, chatId } = Route.useParams()
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data } = useQuery({
    queryKey: ['get-session'],
    queryFn: async () => {
      const data = await getUser()
      return data
    },
  })
  const { data: chatData, isLoading: isLoadingMessages } = useSuspenseQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      getChatHistoryFn({
        data: {
          chatId: chatId,
        },
      }),
  })
  const saveMutation = useMutation({
    mutationFn: saveAssistantMessageFn,
    mutationKey: ['saveAssistantMessage', chatId],
    onSuccess: () => {
      console.log('Assistant message synced with parts!')
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
    },
    onError: (err) => console.error('Failed to sync parts:', err),
  })

  const { messages, sendMessage, isLoading, append, setMessages } = useChat({
    id: chatId,
    connection: fetchServerSentEvents(`/api/chat-${adapter}`, {
      body: {
        conversationId: chatId,
      },
    }),
    // initialMessages: chatData?.messages ?? [],
    onFinish: (message) => {
      console.log('Message from Client: ', message)
      saveMutation.mutate({
        data: {
          chatId: chatId,
          messageId: message.id,
          parts: message.parts,
          role:
            message.role === 'assistant'
              ? 'ASSISTANT'
              : message.role === 'system'
                ? 'SYSTEM'
                : 'USER',
          model: adapter,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      if (chatData) setMessages(chatData?.messages)
      sendMessage(input)
      setInput('')
    }
  }

  useEffect(() => {
    setMessages([])
    queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
    queryClient.invalidateQueries({ queryKey: ['chats'] })
  }, [chatId])

  return (
    <div
      className="flex flex-col h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30"
      key={`${adapter}-${chatId}`}
    >
      <HeaderChat model={adapter} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide space-y-8 py-8 px-4"
        key={chatId}
      >
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {chatData?.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  How can I help you today?
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Start a conversation or ask a technical question.
                </p>
              </div>
            </div>
          )}

          {!messages.length &&
            chatData?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.role === 'assistant'
                    ? 'items-start'
                    : 'items-start flex-row-reverse'
                }`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                    message.role === 'assistant'
                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot size={16} />
                  ) : data?.user ? (
                    <UserAvatar
                      src={data?.user.image as string}
                      alt={data?.user.name as string}
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-[85%] space-y-2 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`relative px-4 py-3 rounded-2xl border ${
                      message.role === 'assistant'
                        ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200'
                        : 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/10'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.parts.map((part, idx) => {
                        if (part.type === 'thinking') {
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-zinc-500 italic mb-3 pb-3 border-b border-zinc-800/50"
                            >
                              <Loader className="animate-spin size-4" />
                              {part.content}
                            </div>
                          )
                        }
                        if (part.type === 'text') {
                          return (
                            <MarkdownRenderer
                              markdown={
                                part.content || '*Nothing to preview...*'
                              }
                              key={idx}
                            />
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                message.role === 'assistant'
                  ? 'items-start'
                  : 'items-start flex-row-reverse'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                  message.role === 'assistant'
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot size={16} />
                ) : data?.user ? (
                  <UserAvatar
                    src={data?.user.image as string}
                    alt={data?.user.name as string}
                  />
                ) : (
                  <User size={16} />
                )}
              </div>

              <div
                className={`flex flex-col max-w-[85%] space-y-2 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`relative px-4 py-3 rounded-2xl border ${
                    message.role === 'assistant'
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200'
                      : 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/10'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {message.parts.map((part, idx) => {
                      if (part.type === 'thinking') {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-zinc-500 italic mb-3 pb-3 border-b border-zinc-800/50"
                          >
                            <Loader className="animate-spin size-4" />
                            {part.content}
                          </div>
                        )
                      }
                      if (part.type === 'text') {
                        return (
                          <MarkdownRenderer
                            markdown={part.content || '*Nothing to preview...*'}
                            key={idx}
                          />
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-4 bg-linear-to-t from-[#09090b] via-[#09090b] to-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="relative flex items-center transition-all duration-200 focus-within:ring-2 ring-blue-500/20 rounded-2xl">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Message something..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-4 pr-14 focus:outline-none focus:border-zinc-700 resize-none placeholder:text-zinc-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-zinc-800 group-hover:scale-105"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-zinc-600 mt-3 uppercase tracking-widest font-medium">
            TanStack AI + Start + Query
          </p>
        </form>
      </footer>
    </div>
  )
}
