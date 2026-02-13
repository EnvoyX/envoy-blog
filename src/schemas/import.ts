import { z } from "zod"

export const singleImportSchema = z.object({
    url: z.string().url({ message: "Invalid URL" }),
    prompt: z.string(),
})

export const bulkImportSchema = z.object({
    url: z.string().url({ message: "Invalid URL" }),
    search: z.string(),
})

export const extractSchema = z.object({
    author: z.string().nullable(),
    publishedAt: z.string().nullable()
})
