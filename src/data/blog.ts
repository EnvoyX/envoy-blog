import { db } from "@/lib/db"
import { createServerFn } from "@tanstack/react-start"

export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await db.post.findUnique({
      where: { slug },
      select: { title: true, description: true , content: true, author: true, tags: true, createdAt: true  }
    })
  })
