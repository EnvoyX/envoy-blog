import { db } from '@/lib/db'
import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import slugify from 'slugify'
import { authMiddleware } from '@/middlewares/auth'
import { postSchema } from '@/schemas/blog'

export const getPostFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await db.post.findUnique({
      where: { slug },
      include: {
        author: true,
        tags: true,
      },
    })
  })

export const createPostFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(postSchema)
  .handler(async ({ data, context }) => {
    const slug = slugify(data.title, { lower: true })

    const existing = await db.post.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const post = await db.post.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        published: data.published,
        content: data.content,
        slug: finalSlug,
        authorId: context.user.id as string,
      },
    })

    return post
  })

export const updatePostFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      postId: z.string(),
      title: z.string(),
      description: z.string(),
      image: z.string(),
      content: z.string(),
      published: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const slug = slugify(data.title, { lower: true })
    let finalSlug
    const current = await db.post.findUnique({
      where: {
        id: data.postId,
      },
    })
    const existing = await db.post.findUnique({ where: { slug } })

    if (current?.slug === existing?.slug) {
      finalSlug = slug
    } else if (current?.slug !== existing?.slug) {
      finalSlug = `${existing?.slug}-${Date.now()}`
    } else if (!existing) {
      finalSlug = slug
    }

    await db.post.update({
      where: {
        id: data.postId,
      },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        published: data.published,
        content: data.content,
        slug: finalSlug,
        authorId: context.user.id as string,
      },
    })
  })

export const getMyPostsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.post.findMany({
      where: { authorId: context.user.id as string },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    })
  })

export const deletePostFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      postId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.post.delete({ where: { id: data.postId } })
    return { success: true }
  })
