import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "@/lib/db";
import { authMiddleware } from "@/middlewares/auth";
import { shortPostSchema } from "@/schemas/post";

export const getGlobalFeedFn = createServerFn({ method: "GET" }).handler(async () => {
  return await db.shortPost.findMany({
    include: {
      author: true,
      Images: true,
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
    orderBy: { createdAt: "desc" },
  });
});

console.log("Is authMiddleware defined?", !!authMiddleware);

export const getShortPostsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.shortPost.findMany({
      where: { authorId: context.user.id },
      orderBy: { createdAt: "desc" },
      include: { author: true, likes: true, comments: true, _count: true, Images: true },
    });
  });

export const getShortPostByIdFn = createServerFn({ method: "GET" })
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
        Images: true,
      },
    });
  });

export const deleteShortPostFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ shortPostId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const imagesInPost = await db.image.findMany({
      where: { shortPostId: data.shortPostId },
    });
    for (const image of imagesInPost) {
      await db.image.update({
        where: { id: image.id },
        data: {
          shortPostId: null,
        },
      });
    }
    await db.shortPost.delete({
      where: { authorId: context.user.id, id: data.shortPostId },
    });

    return true;
  });

export const createShortPostFn = createServerFn({ method: "POST" })
  .inputValidator(shortPostSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      const shortPost = await ctx.shortPost.create({
        data: {
          authorId: context.user.id as string,
          content: data.content,
          published: data.published,
          showPrivateToFollowers: data.showPrivateToFollowers,
        },
      });
      if (!data.images?.length) return;
      const inputtedImages = data.images;
      const inputtedImagesIds = new Set(inputtedImages.map((img) => img.id));
      const dbImages = await db.image.findMany();
      const dbImagesIds = new Set(dbImages.map((img) => img.id));

      // connect db images to the post
      const existingImages = dbImages.filter((dbImg) => inputtedImagesIds.has(dbImg.id));
      const existingImageIds = existingImages.map((img) => img.id);
      await ctx.image.updateMany({
        where: {
          id: {
            in: existingImageIds,
          },
        },
        data: {
          shortPostId: shortPost.id,
        },
      });

      // create new images
      const newImages = inputtedImages.filter((inputImg) => !dbImagesIds.has(inputImg.id));
      if (newImages.length > 0) {
        await ctx.image.createMany({
          data: data.images.map((image) => ({
            shortPostId: shortPost.id,
            userId: context.user.id as string,
            url: image.url,
            title: image.title ?? "",
            description: image.description ?? "",
            published: data.published,
            showPrivateToFollowers: data.showPrivateToFollowers,
          })),
        });
        return;
      } else {
        return;
      }
    });
  });

export const editShortPostFn = createServerFn({ method: "POST" })
  .inputValidator(
    shortPostSchema.extend({
      postId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.user.id as string;

    const shortPost = await db.shortPost.update({
      where: { id: data.postId, authorId: userId },
      data: {
        content: data.content,
        published: data.published,
        showPrivateToFollowers: data.showPrivateToFollowers,
      },
    });

    // from form submission
    const inputtedImages = data.images ?? [];
    const inputtedImageIds = new Set(data.images?.map((image) => image.id));

    // existing images in database
    const dbImages = await db.image.findMany();
    const dbImagesIds = new Set(dbImages?.map((image) => image.id));

    // updated images (in form submission)
    const updatedImages = dbImages?.filter((image) => inputtedImageIds?.has(image.id));
    if (updatedImages.length > 0) {
      await Promise.all(
        updatedImages.map((image) =>
          db.image.update({
            where: { id: image.id },
            data: {
              shortPostId: data.postId,
              url: image.url,
              title: image.title ?? "",
              description: image.description ?? "",
              published: data.published,
              showPrivateToFollowers: data.showPrivateToFollowers,
            },
          }),
        ),
      );
    }

    const prevImages = dbImages.filter((image) => image.shortPostId === data.postId);
    // removed images (not in form submission)
    const removedImages = prevImages?.filter((image) => !inputtedImageIds?.has(image.id));
    const removedImagesId = removedImages.map((image) => image.id);

    // remove images not in form submission
    if (removedImages && removedImages.length > 0) {
      await db.image.updateMany({
        where: {
          id: { in: removedImagesId },
        },
        data: { shortPostId: null },
      });
    }

    // create new images (not in form submission)
    const newImages = inputtedImages.filter((image) => !dbImagesIds?.has(image.id));
    if (newImages && newImages.length > 0) {
      await db.image.createMany({
        data: newImages.map((image) => ({
          shortPostId: shortPost.id,
          userId: context.user.id as string,
          url: image.url,
          title: image.title ?? "",
          description: image.description ?? "",
          published: data.published,
          showPrivateToFollowers: data.showPrivateToFollowers,
        })),
      });
    }
  });

export const getAllLikes = createServerFn({ method: "GET" }).handler(async () => {
  return await db.like.findMany();
});

export const getAllComments = createServerFn({ method: "GET" }).handler(async () => {
  return await db.comment.findMany({
    include: {
      user: true,
    },
  });
});

export const getShortPostLikesFn = createServerFn({ method: "GET" })
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

export const getPostCommentsFn = createServerFn({ method: "GET" })
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

export const toggleLikeFn = createServerFn({ method: "POST" })
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

export const createCommentFn = createServerFn({ method: "POST" })
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

export const updateCommentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ commentId: z.string(), content: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    return await db.comment.update({
      where: { id: data.commentId, userId: context.user.id },
      data: { content: data.content },
    });
  });

export const deleteCommentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ commentId: z.string() }))
  .handler(async ({ data }) => {
    await db.comment.delete({
      where: { id: data.commentId },
    });
    return { success: true };
  });
