import { env } from '@/env';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openRouter = createOpenRouter({
    apiKey: env.AI_OPENROUTER_KEY,
});
