import { firecrawl } from "@/lib/firecrawl";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middlewares/auth";
import { searchSchema } from "@/schemas/discover";
import { SearchResultWeb } from "@mendable/firecrawl-js";


export const searchWeb = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(searchSchema).handler(async ({ data, context }) => {
    const result = await firecrawl.search(data.query, {
        limit: 20,
        tbs: 'qdr:d', // past day
    })

    return result.web?.map((item) => ({
        url: (item as SearchResultWeb).url,
        title: (item as SearchResultWeb).title,
        description: (item as SearchResultWeb).description,
        category: (item as SearchResultWeb).category,
    })) as SearchResultWeb[]
})
