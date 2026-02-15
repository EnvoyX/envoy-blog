import { db } from "@/lib/db";
import { firecrawl } from "@/lib/firecrawl";
import { bulkImportSchema, extractSchema, singleImportSchema } from "@/schemas/import";
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
})).handler(async ({ data, context }) => {
    for (let i = 0; i < data.urls.length; i++) {
        const currentUrl = data.urls[i]

        const item = await db.savedItem.create({
            data: {
                url: currentUrl,
                userId: context.user.id as string,
                status: "PENDING",
            }
        })
        try {
            const result = await firecrawl.scrape(currentUrl, {
                formats: ["markdown",
                    {
                        type: "json",
                        schema: extractSchema,
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
        }
        catch (error) {
            await db.savedItem.update({
                where: {
                    id: item.id
                },
                data: {
                    status: "FAILED"
                }
            })
        }
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
