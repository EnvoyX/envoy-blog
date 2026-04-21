export const BlogStatus = {
  ALL: 'ALL',
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const

export const allowedRoles = ['SUPERADMIN', 'ADMIN']

export type BlogStatus = (typeof BlogStatus)[keyof typeof BlogStatus]

export const MODEL_CONFIG = {
  groq: [
    { label: 'Llama 3.1 (8B)', value: 'llama-3.1-8b-instant' },
    { label: 'Llama 3.3 (70B)', value: 'llama-3.3-70b-versatile' },
    {
      label: 'Llama 4 Scout (17B 16E)',
      value: 'meta-llama/llama-4-scout-17b-16e-instruct',
    },
    { label: 'GPT OSS (20B)', value: 'openai/gpt-oss-20b' },
    { label: 'GPT OSS (120B)', value: 'openai/gpt-oss-120b' },
    { label: 'GPT OSS Safeguard (20B)', value: 'openai/gpt-oss-safeguard-20b' },
  ],
  openrouter: [
    {
      label: 'Trinity Large Preview (Free)',
      value: 'arcee-ai/trinity-large-preview:free',
    },
    {
      label: 'Dolphin Mistral 24B Venice (Free)',
      value: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    },
    { label: 'Gemma 3 12B IT (Free)', value: 'google/gemma-3-12b-it:free' },
    { label: 'Gemma 3 27B IT (Free)', value: 'google/gemma-3-27b-it:free' },
    { label: 'Gemma 3 4B IT (Free)', value: 'google/gemma-3-4b-it:free' },
    { label: 'Gemma 3N E2B IT (Free)', value: 'google/gemma-3n-e2b-it:free' },
    { label: 'Gemma 3N E4B IT (Free)', value: 'google/gemma-3n-e4b-it:free' },
    {
      label: 'Gemma 4 26B A4B IT (Free)',
      value: 'google/gemma-4-26b-a4b-it:free',
    },
    { label: 'Gemma 4 31B IT (Free)', value: 'google/gemma-4-31b-it:free' },
    {
      label: 'LFM 2.5 1.2B Instruct (Free)',
      value: 'liquid/lfm-2.5-1.2b-instruct:free',
    },
    {
      label: 'LFM 2.5 1.2B Thinking (Free)',
      value: 'liquid/lfm-2.5-1.2b-thinking:free',
    },
    {
      label: 'Llama 3.2 3B Instruct (Free)',
      value: 'meta-llama/llama-3.2-3b-instruct:free',
    },
    {
      label: 'Llama 3.3 70B Instruct (Free)',
      value: 'meta-llama/llama-3.3-70b-instruct:free',
    },
    { label: 'MiniMax M2.5 (Free)', value: 'minimax/minimax-m2.5:free' },
    {
      label: 'Hermes 3 Llama 3.1 405B (Free)',
      value: 'nousresearch/hermes-3-llama-3.1-405b:free',
    },
    {
      label: 'Nemotron 3 Nano 30B A3B (Free)',
      value: 'nvidia/nemotron-3-nano-30b-a3b:free',
    },
    {
      label: 'Nemotron 3 Super 120B A12B (Free)',
      value: 'nvidia/nemotron-3-super-120b-a12b:free',
    },
    {
      label: 'Nemotron Nano 12B V2 VL (Free)',
      value: 'nvidia/nemotron-nano-12b-v2-vl:free',
    },
    {
      label: 'Nemotron Nano 9B V2 (Free)',
      value: 'nvidia/nemotron-nano-9b-v2:free',
    },
    { label: 'GPT OSS 120B (Free)', value: 'openai/gpt-oss-120b:free' },
    { label: 'GPT OSS 20B (Free)', value: 'openai/gpt-oss-20b:free' },
    { label: 'OpenRouter Free', value: 'openrouter/free' },
    { label: 'OpenRouter Auto', value: 'openrouter/auto' },
    { label: 'GLM-4.5 Air (Free)', value: 'z-ai/glm-4.5-air:free' },
  ],
  gemini: [
    // { label: 'Gemini 3.1 Pro Preview', value: 'gemini-3.1-pro-preview' },
    // { label: 'Gemini 3 Pro Preview', value: 'gemini-3-pro-preview' },
    { label: 'Gemini 3 Flash Preview', value: 'gemini-3-flash-preview' },
    {
      label: 'Gemini 3.1 Flash Lite Preview',
      value: 'gemini-3.1-flash-lite-preview',
    },
    // { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
    { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    // {
    //   label: 'Gemini 2.5 Flash Preview (09-2025)',
    //   value: 'gemini-2.5-flash-preview-09-2025',
    // },
    { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
    // {
    //   label: 'Gemini 2.5 Flash Lite Preview (09-2025)',
    //   value: 'gemini-2.5-flash-lite-preview-09-2025',
    // },
    // { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    // { label: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite' },
  ],
} as const
