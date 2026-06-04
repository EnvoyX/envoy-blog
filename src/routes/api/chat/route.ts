import { chat, ChatMiddleware, toServerSentEventsResponse } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { groqText } from '@tanstack/ai-groq';
import { openRouterText } from '@tanstack/ai-openrouter';
import { createFileRoute } from '@tanstack/react-router';

import { db } from '@/lib/db';
import { authRouteMiddleware } from '@/middlewares/auth';

type Provider = 'gemini' | 'groq' | 'openrouter';

const adapters = {
  gemini: (requestedModel?: any) => geminiText(requestedModel ?? 'gemini-2.5-flash'),
  groq: (requestedModel?: any) => groqText(requestedModel ?? 'llama-3.3-70b-versatile'),
  openrouter: (requestedModel?: any) =>
    openRouterText(requestedModel ?? 'google/gemma-4-31b-it:free'),
};

export const Route = createFileRoute('/api/chat')({
  server: {
    middleware: [authRouteMiddleware],
    handlers: {
      POST: async ({ request, context }) => {
        // Check for API key
        if (!process.env.OPENROUTER_API_KEY) {
          return new Response(
            JSON.stringify({
              error: 'OPENROUTER_API_KEY not configured',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        } else if (!process.env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({
              error: 'GEMINI_API_KEY not configured',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        } else if (!process.env.GROQ_API_KEY) {
          return new Response(
            JSON.stringify({
              error: 'GROQ_API_KEY not configured',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }

        // middlewares
        const usageTracker: ChatMiddleware = {
          name: 'usage-tracker',
          onUsage: (ctx, usage) => {
            console.log(`Iteration ${ctx.iteration}: ${usage.totalTokens} tokens`);
          },
        };

        const terminal: ChatMiddleware = {
          name: 'terminal',
          onFinish: async (ctx, info) => {
            console.log(`Finished: ${info.finishReason}, ${info.duration}ms`);
            console.log(`Content: ${info.content}`);
            if (info.usage) {
              console.log(`Tokens: ${info.usage.totalTokens}`);
            }
          },

          onAbort: (ctx, info) => {
            console.log(`Aborted: ${info.reason}, ${info.duration}ms`);
          },
          onError: (ctx, info) => {
            console.error(`Error after ${info.duration}ms:`, info.error);
          },
        };

        const logger: ChatMiddleware = {
          name: 'logger',
          onStart: (ctx) => {
            console.log(
              `Request ${ctx.requestId} started at iteration ${ctx.iteration}`,
              `Model ${ctx.model} started at iteration ${ctx.iteration}`,
            );
          },
          onFinish: (ctx, info) => {
            console.log(`Request ${ctx.requestId}] Finished in ${info.duration}ms`);
          },
        };

        // metadata from client
        const body = await request.json();
        console.log('Body: ', body);
        const messages = body.messages;
        const bodyDataRequest = body.data;
        const forwardedProvider = body.forwardedProps;
        const provider: Provider = body.forwardedProps?.providerAdapter as Provider;
        console.log('Body Data Request: ', bodyDataRequest);
        console.log('Forwarded Provider: ', forwardedProvider);
        console.log('Provider: ', provider);

        // processing request
        const { conversationId, requestModel } = bodyDataRequest;
        console.log('Requested Model: ', requestModel);
        console.log('ChatId/ConversationId from body request', conversationId);
        console.log('Messages: ', messages);
        console.log(
          'Messages Parts: ',
          messages.map((message: any) => message.parts),
        );
        console.log('Message Parts: ', messages[messages.length - 1].parts);
        const lastUserMessage = messages[messages.length - 1];

        try {
          let chatId: string | undefined = conversationId;
          console.log('Current ChatId before saving last message', chatId);
          console.log(
            'Current content before saving last message',
            lastUserMessage.parts[0].content,
          );
          console.log('Current messageId before saving last message', lastUserMessage.id);

          if (!chatId) throw new Error('Could not resolve Chat ID');

          const existingConversation = await db.chat.findUnique({
            where: {
              id: chatId,
            },
          });

          console.log('Existing chat available');

          if (!existingConversation) {
            // const result = await summarize({
            //   adapter: openRouterSummarize('google/gemma-4-31b-it:free'),
            //   text: lastUserMessage.parts[0]?.content,
            //   maxLength: 100,
            //   style: 'concise', // "concise" | "bullet-points" | "paragraph"
            // })

            // console.log('Topic/Title summary: ', result.summary)
            const saveConversation = await db.chat.create({
              data: {
                id: chatId as string,
                title: 'New Chat',
                userId: context.user.id as string,
                model: provider,
              },
            });
            console.log('Last chat saved:', saveConversation.id);
          }

          console.log('Existing conversation:', existingConversation?.id);
          console.log('Current chatId:', chatId);

          const savedUserMessage = await db.message.create({
            data: {
              messageId: lastUserMessage.id,
              chatId: chatId,
              role: 'USER',
              content: lastUserMessage.parts[0].content,
              model: provider,
              createdAt: lastUserMessage.createdAt,
              parts: lastUserMessage.parts,
            },
          });

          console.log('Last message saved:', savedUserMessage.id);

          const stream = chat({
            adapter: adapters[provider](requestModel),
            messages,
            middleware: [logger, usageTracker, terminal],
            conversationId: chatId,
            // debug: true,
            context: {
              chatId: chatId,
            },
          });

          // Convert stream to HTTP response
          return toServerSentEventsResponse(stream);
        } catch (error) {
          console.error('Error:', error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'An error occurred',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      },
    },
  },
});
