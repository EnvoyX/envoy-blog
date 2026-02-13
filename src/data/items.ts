import { db } from "@/lib/db";
import { firecrawl } from "@/lib/firecrawl";
import { extractSchema, singleImportSchema } from "@/schemas/import";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middlewares/auth";

export const scrapeUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(singleImportSchema).handler(async ({ data, context }) => {
    const item = await db.savedItem.create({
        data: {
            url: data.url,
            userId: context.user.id as string,
            status: "PROCESSING",
            prompt: data.prompt
        }
    })
    try {
        const result = await firecrawl.scrape(data.url, {
            formats: ["markdown",
                {
                    type: "json",
                    schema: extractSchema,
                    prompt: item.prompt
                }
            ],
        })

        const jsonData = result.json as z.infer<typeof extractSchema>

        let publishedAt = null

        if (jsonData.publishedAt) {
            const parsed = new Date(jsonData.publishedAt)

            if (!isNaN(parsed.getTime())) {
                publishedAt = parsed
            }
        }

        const updatedItem = await db.savedItem.update({
            where: {
                id: item.id
            },
            data: {
                title: result.metadata?.title || null,
                content: result.markdown || null,
                ogImage: result.metadata?.ogImage || null,
                author: jsonData.author || null,
                publishedAt: publishedAt || null,
                status: "COMPLETED",
                description: result.metadata?.description || null,
                ogDescription: result.metadata?.ogDescription || null,
                ogTitle: result.metadata?.ogTitle || null,
                ogUrl: result.metadata?.ogUrl || null,
                ogSiteName: result.metadata?.ogSiteName || null,
                sourceUrl: result.metadata?.sourceURL || null,
                prompt: data.prompt || null,
            }
        })
        return updatedItem
    }
    catch (error) {
        const failedItem = await db.savedItem.update({
            where: {
                id: item.id
            },
            data: {
                status: "FAILED"
            }
        })
        return failedItem
    }

})
