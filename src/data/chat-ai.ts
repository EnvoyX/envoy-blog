import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { z } from 'zod'
import { authMiddleware } from '@/middlewares/auth'

export type MessageRole = 'user' | 'assistant' | 'system'

export const getChatHistoryFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      chatId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const chat = await db.chat.findUnique({
      where: { id: data.chatId, userId: context.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) return null

    const formattedMessages = chat.messages.map((msg) => {
      const msgParts =
        typeof msg.parts === 'string'
          ? JSON.parse(msg.parts)
          : (msg.parts as any[])

      return {
        id: msg.messageId,
        role: msg.role.toLowerCase() as MessageRole,
        createdAt: msg.createdAt.toISOString(),
        parts: msgParts.map((part: any) => {
          if (part.type === 'thinking') {
            return {
              type: 'thinking',
              content: part.content,
            }
          }
          return {
            type: 'text',
            content: part.content,
          }
        }),
      }
    })

    return {
      chatId: chat.id,
      title: chat.title,
      messages: formattedMessages,
    }
  })

export const getChatListFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.chat.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
      //   select: { id: true, title: true, createdAt: true, model: true },
    })
  })

export const saveAssistantMessageFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      messageId: z.string(),
      chatId: z.string(),
      role: z.enum(['ASSISTANT', 'USER', 'TOOL', 'SYSTEM']),
      parts: z.array(z.any()), // Use JSON-safe validation here
      model: z.string().optional(),
      recentModel: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    // use upsert so that if the server *did* manage to create it,
    // upsert function just update it with the rich 'parts' data.
    // return await db.message.upsert({
    //   where: { messageId: data.messageId },
    //   update: {
    //     parts: data.parts,
    //   },
    //   create: {
    //     messageId: data.messageId,
    //     chatId: data.chatId,
    //     role: data.role,
    //     content: data.parts.find((p) => p.type === 'text')?.content || '',
    //     parts: data.parts,
    //     model: data.model,
    //   },
    // })
    await db.chat.update({
      where: {
        id: data.chatId,
      },
      data: {
        recentModel: data.recentModel,
      },
    })
    const assistantMessage = await db.message.create({
      data: {
        messageId: data.messageId,
        chatId: data.chatId,
        role: data.role,
        content: data.parts.find((p) => p.type === 'text')?.content || '',
        parts: data.parts,
        model: data.model,
      },
    })
    return assistantMessage
  })

export const updateChatTitleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      chatId: z.string(),
      title: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.chat.update({
      where: { id: data.chatId },
      data: { title: data.title },
    })
  })

export const deleteChatFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      chatId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.chat.delete({
      where: { id: data.chatId },
    })
  })
