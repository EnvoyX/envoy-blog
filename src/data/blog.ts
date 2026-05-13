import { createServerFn } from '@tanstack/react-start';
import slugify from 'slugify';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';
import { postSchema } from '@/schemas/blog';

export const getPostFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return await db.post.findUnique({
      where: { slug },
      include: {
        author: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: true,
      },
    });
  });

export const getAllLikes = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.like.findMany();
});

export const getAllComments = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.comment.findMany({
    include: {
      user: true,
    },
  });
});

export const getPostLikesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      postId: z.string(),
      slug: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.like.findMany({
      where: {
        postId: data.postId,
        post_slug: data.slug,
      },
    });
  });

export const getPostCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      postId: z.string(),
      slug: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.comment.findMany({
      where: {
        postId: data.postId,
        post_slug: data.slug,
      },
      include: {
        user: true,
      },
    });
  });

export const toggleLikeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.string(), postId: z.string(), slug: z.string() }))
  .handler(async ({ data, context }) => {
    const userId = context.user.id;

    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: userId as string,
          postId: data.postId,
        },
      },
    });

    if (existingLike) {
      await db.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }

    await db.like.create({
      data: {
        id: data.id,
        userId: userId as string,
        postId: data.postId,
        post_slug: data.slug,
      },
    });

    return { liked: true };
  });

export const createCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      postId: z.string(),
      slug: z.string(),
      content: z.string().min(1),
      parentId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return await db.comment.create({
      data: {
        id: data.id,
        content: data.content,
        postId: data.postId,
        post_slug: data.slug,
        userId: context.user.id as string,
        parentId: data.parentId,
      },
    });
  });

export const updateCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ commentId: z.string(), content: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    return await db.comment.update({
      where: { id: data.commentId, userId: context.user.id },
      data: { content: data.content },
    });
  });

export const deleteCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ commentId: z.string() }))
  .handler(async ({ data }) => {
    await db.comment.delete({
      where: { id: data.commentId },
    });
    return { success: true };
  });

export const createPostFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(postSchema)
  .handler(async ({ data, context }) => {
    const slug = slugify(data.title, { lower: true });

    const existing = await db.post.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const post = await db.post.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        published: data.published,
        content: data.content,
        slug: finalSlug,
        authorId: context.user.id as string,
        showPrivateToFollowers: data.showPrivateToFollowers,
      },
    });

    return post;
  });

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
    const slug = slugify(data.title, { lower: true });
    let finalSlug;
    const current = await db.post.findUnique({
      where: {
        id: data.postId,
      },
    });
    const existing = await db.post.findUnique({ where: { slug } });

    if (current?.slug === existing?.slug) {
      finalSlug = slug;
    } else if (current?.slug !== existing?.slug) {
      finalSlug = `${existing?.slug}-${Date.now()}`;
    } else if (!existing) {
      finalSlug = slug;
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
    });
  });

export const getMyPostsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.post.findMany({
      where: { authorId: context.user.id as string },
      orderBy: { createdAt: 'desc' },
      include: { author: true, likes: true, comments: true, _count: true },
    });
  });

export const getPostsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true, likes: true, comments: true, _count: true },
  });
});

export const deletePostFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      postId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.post.delete({ where: { id: data.postId } });
    return { success: true };
  });
