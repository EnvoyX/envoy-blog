import { z } from "zod"

export const singleImportSchema = z.object({
    url: z.url({ error: "Invalid URL" })
})

export const bulkImportSchema = z.object({
    url: z.url({ error: "Invalid URL" }),
    search: z.string(),
})
