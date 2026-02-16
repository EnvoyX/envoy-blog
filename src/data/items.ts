import { db } from "@/lib/db";
import { firecrawl } from "@/lib/firecrawl";
import { bulkImportSchema, extractSchema, singleImportSchema } from "@/schemas/import";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "@/middlewares/auth";
import { notFound } from "@tanstack/react-router"
import { generateText } from "ai";
import { openRouter } from "@/lib/open-router";


export type BulkScrapeProgress = {
    completed: number;
    total: number;
    url: string;
    status: "Success" | "Progress" | "Failed"
}

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
                    // schema: extractSchema,
                    prompt: item.prompt ? item.prompt : "Please extract the author and also publishedAt timestamp if available, otherwise put the author same as website name and publishedAt as current date"
                }
            ],
            location: {
                country: "US",
                languages: ["en"]
            },
            onlyMainContent: true,
            proxy: "auto"
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

export const mapUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(bulkImportSchema).handler(async ({ data, context }) => {
    console.log(data)
    console.log(context)
    const result = await firecrawl.map(data.url, {
        limit: 25,
        search: data.search,
        location: {
            country: "US",
            languages: ["en"]
        }
    })
    return result.links
})


export const bulkScrapeUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({
    urls: z.array(z.string().url()),
})).handler(async function* ({ data, context }) {
    const total = data.urls.length;
    for (let i = 0; i < data.urls.length; i++) {
        const currentUrl = data.urls[i]
        const item = await db.savedItem.create({
            data: {
                url: currentUrl,
                userId: context.user.id as string,
                status: "PENDING",
            }
        })
        let status: BulkScrapeProgress["status"] = "Progress"
        try {
            const result = await firecrawl.scrape(currentUrl, {
                formats: ["markdown",
                    {
                        type: "json",
                        // schema: extractSchema,
                        prompt: item.prompt ? item.prompt : "Please extract the author and also publishedAt timestamp if available, otherwise put the author same as website name and publishedAt as current date"
                    }
                ],
                location: {
                    country: "US",
                    languages: ["en"]
                },
                onlyMainContent: true,
                proxy: "auto"
            })

            const jsonData = result.json as z.infer<typeof extractSchema>

            let publishedAt = null

            if (jsonData.publishedAt) {
                const parsed = new Date(jsonData.publishedAt)

                if (!isNaN(parsed.getTime())) {
                    publishedAt = parsed
                }
            }

            await db.savedItem.update({
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
                }
            })
            status = "Success"
        }
        catch (error) {
            status = "Failed"
            await db.savedItem.update({
                where: {
                    id: item.id
                },
                data: {
                    status: "FAILED"
                }
            })
        }
        const progress: BulkScrapeProgress = {
            completed: i + 1,
            total: total,
            url: currentUrl,
            status: status
        }
        yield progress
    }
})

export const getItems = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
    const items = await db.savedItem.findMany({
        where: {
            userId: context.user.id
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return items
})

export const getItemById = createServerFn({ method: "GET" }).middleware([authMiddleware]).inputValidator(z.object({
    itemId: z.string()
})).handler(async ({ context, data }) => {
    const item = await db.savedItem.findUnique(
        {
            where: {
                userId: context.user.id,
                id: data.itemId
            }
        }
    )
    if (!item) {
        throw notFound()
    }

    return item
})

export const saveSummaryAndGenerateTags = createServerFn({ method: "POST" })
    .middleware([authMiddleware]).inputValidator(z.object({
        itemId: z.string(),
        summary: z.string()
    })).handler(async ({ data, context }) => {
        const existing = await db.savedItem.findUnique({
            where: {
                id: data.itemId,
                userId: context.user.id
            }
        })

        if (!existing) {
            console.log('Item not found')
            throw notFound()
        }

        const { text } = await generateText({
            model: openRouter.chat('z-ai/glm-4.5-air:free'),
            system: `You are a helpful assistant that extracts relevant tags from content summaries.
        Extract 3-5 short, relevant tags that categorize the content.
        Return ONLY a comma-separated list of tags, nothing else.
        Example: Technology, Programming, Web Development, Javascript`,
            prompt: `Extract tags from this summary: \n\n${data.summary}`,
        })

        const tags = text.split(",").map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0).slice(0, 5)

        const item = await db.savedItem.update({
            where: {
                id: data.itemId,
                userId: context.user.id
            },
            data: {
                summary: data.summary,
                tags: tags
            }
        })

        return item
    })
