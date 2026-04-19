import { ChatInput } from '@/components/ai-elements/ChatInput'
import { Button } from '@/components/ui/button'
import HeaderChat from '@/components/web/HeaderChat'
import { MarkdownRenderer } from '@/components/web/markdown/Markdown'
import { UserAvatar } from '@/components/web/user-profile'
import { getChatHistoryFn, saveAssistantMessageFn } from '@/data/chat-ai'
import { getUser } from '@/data/session'
import { MODEL_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { UIMessage } from '@tanstack/ai'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  // useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import {
  Bot,
  Check,
  Copy,
  Loader,
  Loader2,
  RepeatIcon,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'

export const Route = createFileRoute('/_chat/chat/_chatbox/$adapter/$chatId/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      model: z.string().optional(),
    }),
  ),
})

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

function RouteComponent() {
  const { adapter, chatId } = Route.useParams()
  const { model } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const currentModel = model
  const [targetMessageIds, setTargetMessageIds] = useState<Set<string>>(
    new Set(),
  )
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data } = useQuery({
    queryKey: ['get-session'],
    queryFn: async () => {
      const data = await getUser()
      return data
    },
  })
  const { data: chatData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      getChatHistoryFn({
        data: {
          chatId: chatId,
        },
      }),
  })
  const { mutate } = useMutation({
    mutationFn: saveAssistantMessageFn,
    mutationKey: ['saveAssistantMessage', chatId],
    onError: (err) => {
      console.error('Failed to sync parts:', err.message)
    },
    onSettled: () => {
      console.log('Assistant message synced with parts!')
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  function onModelChange(model: string) {
    navigate({
      search: (prev) => ({ ...prev, model: model }),
      replace: true,
      reloadDocument: true,
    })
  }

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    id: chatId,
    connection: fetchServerSentEvents(
      () => `/api/chat-${adapter}`,
      async () => {
        console.log(`[AI Engine]: Initiating ${currentModel}`)
        return {
          body: {
            conversationId: chatId,
            requestModel: currentModel,
          },
        }
      },
    ),
    onError(error) {
      toast.error('Error has been occured', {
        description:
          'Please try again or try use different model. The model you used may not available right now.',
        duration: 5000,
      })
      console.error(error.message)
    },
    onFinish: (message) => {
      console.log('Message from Client: ', message)
      mutate({
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
          recentModel: currentModel,
        },
      })
    },
  })

  function onSend(input: string) {
    if (!model) {
      toast.error('Select the model first!')
      return
    }
    sendMessage(input)
  }
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setMessages([])
    queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
  }, [chatId])

  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages as unknown as UIMessage[])
    }
  }, [chatData?.messages, setMessages])

  if (isLoadingMessages) {
    return (
      <div
        className="flex flex-col h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30"
        key={`${adapter}-${chatId}`}
      >
        <HeaderChat
          model={adapter}
          currentModel={currentModel as string}
          provider={adapter as keyof typeof MODEL_CONFIG}
          onModelChange={onModelChange}
        />

        <div
          ref={scrollRef}
          className="flex-1 flex overflow-y-auto scrollbar-hide space-y-8 py-8 px-4 items-center justify-center"
          key={chatId}
        >
          <Loader2 className="animate-spin size-12" />
        </div>

        <footer className="p-4 bg-linear-to-t from-[#09090b] via-[#09090b] to-transparent">
          <ChatInput onSend={onSend} isLoading={isLoading} />
        </footer>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30"
      key={`${adapter}-${chatId}`}
    >
      <HeaderChat
        model={adapter}
        currentModel={currentModel as string}
        provider={adapter as keyof typeof MODEL_CONFIG}
        onModelChange={onModelChange}
      />

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

          {/* fail-safe if the queried chat history isn't loaded */}
          {/* {!messages.length &&
            !isLoadingMessages &&
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
                        if (part.type === 'text' && !isViewRaw) {
                          return (
                            <MarkdownRenderer
                              markdown={
                                part.content || '*Nothing to preview...*'
                              }
                              key={idx}
                            />
                          )
                        }

                        if (part.type === 'text' && isViewRaw) {
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
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        content={message.parts.map((p) => p.content).join('')}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsViewRaw((prev) => !prev)}
                        className="h-8 px-2 text-zinc-400"
                      >
                        <RepeatIcon size={14} />
                        <span className="ml-2 text-xs">
                          {isViewRaw ? `View Markdown` : `View Raw`}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))} */}
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
                      if (
                        part.type === 'thinking' &&
                        !targetMessageIds.has(message.id)
                      ) {
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
                        part.type === 'thinking' &&
                        targetMessageIds.has(message.id)
                      ) {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-zinc-500 italic mb-3 pb-3 border-b border-zinc-800/50"
                          >
                            <pre
                              className={cn(
                                'whitespace-pre-wrap font-mono text-[13px] bg-zinc-950 p-3 rounded-lg border border-zinc-800',
                              )}
                            >
                              {part.content}
                            </pre>
                          </div>
                        )
                      }

                      if (
                        part.type === 'text' &&
                        !targetMessageIds.has(message.id)
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
                        targetMessageIds.has(message.id)
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
                        setTargetMessageIds((prev) => {
                          const next = new Set(prev)
                          if (next.has(message.id)) next.delete(message.id)
                          else next.add(message.id)
                          return next
                        })
                      }}
                      className="h-8 px-2 text-zinc-400"
                    >
                      <RepeatIcon size={14} />
                      <span className="ml-2 text-xs">
                        {targetMessageIds.has(message.id)
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
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </footer>
    </div>
  )
}
