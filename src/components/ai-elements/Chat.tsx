import { useEffect, useRef, useState } from 'react'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { Bot, Check, Copy, Loader, RepeatIcon, Send, User } from 'lucide-react'
import { MarkdownRenderer } from '../web/markdown/Markdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUser } from '@/data/session'
import { UserAvatar } from '../web/user-profile'
import { saveAssistantMessageFn } from '@/data/chat-ai'
import HeaderChat from '../web/HeaderChat'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 px-2 text-zinc-400"
    >
      {copied ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <Copy size={14} />
      )}
      <span className="ml-2 text-xs">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  )
}

export function Chat({
  apiRoute,
  model,
  chatId,
}: {
  apiRoute: string
  model: string
  chatId: string
}) {
  const [input, setInput] = useState('')
  const [targetMessageIds, setTargetMessageIds] = useState<string[]>([])
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data } = useQuery({
    queryKey: ['get-session'],
    queryFn: async () => {
      const data = await getUser()
      return data
    },
  })
  const saveMutation = useMutation({
    mutationFn: saveAssistantMessageFn,
    mutationKey: ['saveAssistantMessage'],
    onSuccess: () => {
      console.log('Assistant message synced with parts!')
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (err) => console.error('Failed to sync parts:', err.message),
  })

  const { messages, sendMessage, isLoading } = useChat({
    id: chatId,
    connection: fetchServerSentEvents(apiRoute, {
      body: {
        conversationId: `chat-${chatId}`,
      },
    }),
    onFinish: (message) => {
      console.log('Message from Client: ', message)
      saveMutation.mutate({
        data: {
          chatId: `chat-${chatId}`,
          messageId: message.id,
          parts: message.parts,
          role:
            message.role === 'assistant'
              ? 'ASSISTANT'
              : message.role === 'system'
                ? 'SYSTEM'
                : 'USER',
          model: model,
        },
      })
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      <HeaderChat model={model} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide space-y-8 py-8 px-4"
      >
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {messages.length === 0 && (
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
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
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
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200 w-full'
                      : 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/10'
                  }`}
                >
                  <div className="prose prose-invert prose-sm sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden">
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

                      if (
                        part.type === 'text' &&
                        !targetMessageIds.includes(message.id)
                      ) {
                        return (
                          <MarkdownRenderer
                            markdown={part.content || '*Nothing to preview...*'}
                            key={idx}
                          />
                        )
                      }

                      if (
                        part.type === 'text' &&
                        targetMessageIds.includes(message.id)
                      ) {
                        return (
                          <pre
                            className={cn(
                              'whitespace-pre-wrap font-mono text-[13px] bg-zinc-950 p-3 rounded-lg border border-zinc-800',
                              {
                                'bg-emerald-600 border-none':
                                  message.role === 'user',
                              },
                            )}
                          >
                            {part.content}
                          </pre>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
                {message.role === 'assistant' && !isLoading && (
                  // note: add opacity-0 && group-hover:opacity-100 for better ui
                  <div className="flex items-center gap-2 mt-2 transition-opacity">
                    <CopyButton
                      content={message.parts
                        .map((part) => {
                          if (part.type === 'text') return part.content
                        })
                        .join('')}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTargetMessageIds((prevIds) => {
                          if (prevIds.includes(message.id)) {
                            return prevIds.filter((id) => id !== message.id)
                          }
                          return [...prevIds, message.id]
                        })
                      }}
                      className="h-8 px-2 text-zinc-400"
                    >
                      <RepeatIcon size={14} />
                      <span className="ml-2 text-xs">
                        {targetMessageIds.includes(message.id)
                          ? `View Original`
                          : `View Raw`}
                      </span>
                    </Button>
                  </div>
                )}
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
