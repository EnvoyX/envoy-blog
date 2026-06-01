import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';
import { shortPostSchema } from '@/schemas/post';

export const getGlobalFeedFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.shortPost.findMany({
    include: {
      author: true,
      imagesOnShortPosts: {
        include: {
          image: true,
        },
      },
      comments: {
        include: {
          user: true,
        },
      },
      likes: true,
      _count: {
        select: { likes: true, comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

export const getAuthorFeedFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.shortPost.findMany({
    where: {
      author: {
        email: 'muhamadhanifhafizhan@gmail.com',
      },
      published: true,
    },
    include: {
      author: true,
      imagesOnShortPosts: {
        include: {
          image: true,
        },
      },
      comments: {
        include: {
          user: true,
        },
      },
      likes: true,
      _count: {
        select: { likes: true, comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

export const getShortPostsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.shortPost.findMany({
      where: { authorId: context.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        likes: true,
        comments: true,
        _count: true,
        imagesOnShortPosts: {
          include: {
            image: true,
          },
        },
      },
    });
  });

export const getShortPostByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ shortPostId: z.string() }))
  .handler(async ({ data }) => {
    return await db.shortPost.findUnique({
      where: { id: data.shortPostId },
      include: {
        author: {
          include: {
            followers: {
              include: {
                follower: true,
              },
            },
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            user: true,
          },
        },
        _count: true,
        imagesOnShortPosts: {
          include: {
            image: true,
          },
        },
      },
    });
  });

export const createShortPostFn = createServerFn({ method: 'POST' })
  .inputValidator(shortPostSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(
      async (ctx) => {
        const userId = context.user.id as string;
        const inputtedImages = data.images ?? [];
        const newPost = await ctx.shortPost.create({
          data: {
            authorId: userId,
            content: data.content,
            published: data.published,
            showPrivateToFollowers: data.showPrivateToFollowers,
          },
        });

        if (!data.images?.length) return newPost;

        const newImagesData = inputtedImages.filter((img) => !img.id); // imported images
        const existingImagesData = inputtedImages.filter((img) => img.id); // images picked from gallery
        const existingImageIds = inputtedImages.filter((img) => img.id).map((img) => img.id);

        // create new images
        let newImageIds: string[] = [];
        if (newImagesData.length > 0) {
          const createdImages = await ctx.image.createManyAndReturn({
            data: newImagesData.map((image) => ({
              url: image.url,
              title: image.title ?? '',
              description: image.description ?? '',
              userId: userId,
              published: data.published,
              showPrivateToFollowers: data.showPrivateToFollowers,
            })),
          });
          newImageIds = createdImages.map((img) => img.id);
        }

        // update metadata of images picked from gallery
        if (existingImagesData.length > 0) {
          await Promise.all(
            existingImagesData.map((img) =>
              ctx.image.update({
                where: { id: img.id },
                data: {
                  url: img.url ?? '',
                  title: img.title ?? '',
                  description: img.description ?? '',
                  published: data.published,
                  showPrivateToFollowers: data.showPrivateToFollowers,
                },
              }),
            ),
          );
        }

        const allImageIds = [...newImageIds, ...existingImageIds];

        if (allImageIds.length > 0) {
          await ctx.imagesOnShortPosts.createMany({
            data: allImageIds.map((imgId) => ({
              imageId: imgId as string,
              shortPostId: newPost.id,
            })),
          });
        }
      },
      {
        maxWait: 5000, // Max wait to acquire transaction (default: 2000ms)
        timeout: 900000, // Max transaction run time (default: 5000ms)
      },
    );
  });

export const editShortPostFn = createServerFn({ method: 'POST' })
  .inputValidator(
    shortPostSchema.extend({
      postId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.user.id as string;
    const inputtedImages = data.images ?? [];

    await db.$transaction(
      async (tx) => {
        await tx.shortPost.update({
          where: { id: data.postId, authorId: userId },
          data: {
            content: data.content,
            published: data.published,
            showPrivateToFollowers: data.showPrivateToFollowers,
          },
        });

        const currentPostImageIds = await tx.imagesOnShortPosts.findMany({
          where: { shortPostId: data.postId },
          select: { imageId: true },
        });
        const currentImageIds = new Set(currentPostImageIds.map((postData) => postData.imageId));

        //  categorize incoming image data
        const newImagesData = inputtedImages.filter((img) => !img.id); // imported images
        const existingImagesData = inputtedImages.filter((img) => img.id); // images picked from gallery
        const inputtedExistingImageIds = new Set(existingImagesData.map((img) => img.id as string)); // ids of images picked from gallery

        // disconnect removed images from the junction table
        const idsToDelete = [...currentImageIds].filter((id) => !inputtedExistingImageIds.has(id));
        if (idsToDelete.length > 0) {
          await tx.imagesOnShortPosts.deleteMany({
            where: {
              shortPostId: data.postId,
              imageId: { in: idsToDelete },
            },
          });
        }

        // update metadata of images picked from gallery
        if (existingImagesData.length > 0) {
          await Promise.all(
            existingImagesData.map((img) =>
              tx.image.update({
                where: { id: img.id },
                data: {
                  url: img.url ?? '',
                  title: img.title ?? '',
                  description: img.description ?? '',
                  published: data.published,
                  showPrivateToFollowers: data.showPrivateToFollowers,
                },
              }),
            ),
          );
        }

        // create new imported images
        let newImageIds: string[] = [];
        if (newImagesData.length > 0) {
          const createdImages = await tx.image.createManyAndReturn({
            data: newImagesData.map((image) => ({
              url: image.url,
              title: image.title ?? '',
              description: image.description ?? '',
              userId: userId,
              published: data.published,
              showPrivateToFollowers: data.showPrivateToFollowers,
            })),
          });
          newImageIds = createdImages.map((img) => img.id);
        }

        // link or insert existing gallery images to the post
        const idsToInsert = [...inputtedExistingImageIds].filter((id) => !currentImageIds.has(id));

        // merge newly created image Ids and newly picked gallery image Ids
        const mergedImageIds = [...idsToInsert, ...newImageIds];

        if (mergedImageIds.length > 0) {
          await tx.imagesOnShortPosts.createMany({
            data: mergedImageIds.map((imgId) => ({
              shortPostId: data.postId,
              imageId: imgId,
            })),
          });
        }
      },
      {
        maxWait: 5000, // Max wait to acquire transaction (default: 2000ms)
        timeout: 900000, // Max transaction run time (default: 5000ms)
      },
    );
  });
export const deleteShortPostFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ shortPostId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.user.id as string;

    await db.shortPost.delete({
      where: {
        id: data.shortPostId,
        authorId: userId,
      },
    });

    return true;
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

export const getShortPostLikesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      shortPostId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.like.findMany({
      where: {
        shortPostId: data.shortPostId,
      },
    });
  });

export const getPostCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      shortPostId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.comment.findMany({
      where: {
        shortPostId: data.shortPostId,
      },
      include: {
        user: true,
      },
    });
  });

export const toggleLikeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.string(), shortPostId: z.string() }))
  .handler(async ({ data, context }) => {
    const userId = context.user.id;

    const existingLike = await db.like.findFirst({
      where: {
        userId: userId as string,
        shortPostId: data.shortPostId,
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
        shortPostId: data.shortPostId,
      },
    });

    return { liked: true };
  });

export const createCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      shortPostId: z.string(),
      content: z.string().min(1),
      parentId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return await db.comment.create({
      data: {
        id: data.id,
        content: data.content,
        shortPostId: data.shortPostId,
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
