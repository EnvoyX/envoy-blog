import { db } from "@/lib/db"
import { createServerFn } from "@tanstack/react-start"

export const getDiary = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await db.diary.findUnique({
      where: { slug },
      select: { title: true, description: true, content: true, user: true, createdAt: true  }
    })
  })
