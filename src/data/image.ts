import { createServerFn } from '@tanstack/react-start';
import { Effect } from 'effect';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';
import { editImageSchema, editImagesSchema, imageSchema } from '@/schemas/image';

// export const tempMigrateFn = createServerFn().handler(async () => {
//   // find all images that currently belong to a short post
//   const imagesWithPosts = await db.image.findMany({
//     where: {
//       shortPostId: { not: null },
//     },
//     select: {
//       id: true,
//       shortPostId: true,
//     },
//   });

//   console.log(`Found ${imagesWithPosts.length} relations to migrate...`);

//   // loop through and insert them into the new join table
//   for (const img of imagesWithPosts) {
//     if (img.shortPostId) {
//       await db.imagesOnShortPosts.upsert({
//         where: {
//           imageId_shortPostId: {
//             imageId: img.id,
//             shortPostId: img.shortPostId,
//           },
//         },
//         update: {},
//         create: {
//           imageId: img.id,
//           shortPostId: img.shortPostId,
//         },
//       });
//     }
//   }

//   console.log("Migration complete!");
// });

export const saveImageUrl = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.string().optional(),
      url: z.string(),
      filename: z.string(),
      size: z.string(),
      imgbbId: z.string().optional(),
      type: z.string().optional(),
      albumId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    console.log('[server] Saving image URL to DB:', data);
    const newImage = await db.image.create({
      data: {
        id: data.id,
        url: data.url,
        title: data.filename,
        userId: context.user.id as string,
        source: 'IMGBB',
        size: data.size,
      },
    });
    if (data.albumId) {
      await db.album.update({
        where: {
          id: data.albumId,
        },
        data: {
          images: {
            connect: {
              id: newImage.id,
            },
          },
        },
      });
    }
    return {
      ok: true,
      savedAt: new Date().toISOString(),
      url: data.url,
    };
  });

export const getImagesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getImagesWithAlbumFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        albums: true,
      },
    });
  });

export const getImagesWithAlbumsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        albums: true,
        user: true,
      },
    });
  });

export const getPublicImagesFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.image.findMany({
    where: { shortPost: { published: true } },
    orderBy: { createdAt: 'desc' },
  });
});

export const getImagesByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    return await db.image.findMany({
      where: { userId: data.userId },
      orderBy: { createdAt: 'desc' },
    });
  });

export const ImportImagesFn = createServerFn({ method: 'POST' })
  .inputValidator(imageSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.image.createMany({
      data: data.image.map((img) => ({
        userId: context.user.id as string,
        url: img.url,
        title: img.title,
        description: img.description,
        published: data.published,
        showPrivateToFollowers: data.showPrivateToFollowers,
      })),
    });
    return true;
  });

export const ImportImageToAlbumFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageUrl: z.url(),
      albumId: z.string(),
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      if (data.imageUrl) {
        await ctx.album.update({
          where: {
            id: data.albumId,
            authorId: context.user.id,
          },
          data: {
            images: {
              connect: {
                id: data.imageId,
                url: data.imageUrl,
              },
            },
            updatedAt: new Date(),
          },
        });
      }
    });
    return true;
  });

export const ImportImagesToAlbumFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      published: z.boolean(),
      images: z.array(z.string()),
      albumId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      if (!data.images?.length) return;
      if (data.images) {
        const images = await ctx.image.createManyAndReturn({
          data: data.images.map((image) => ({
            userId: context.user.id as string,
            url: image,
            published: data.published,
          })),
        });
        await ctx.album.update({
          where: {
            id: data.albumId,
            authorId: context.user.id,
          },
          data: {
            images: {
              connect: images,
            },
            updatedAt: new Date(),
          },
        });
      }
    });
    return true;
  });

export const editImageFn = createServerFn({ method: 'POST' })
  .inputValidator(
    editImageSchema.extend({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.update({
        where: {
          id: data.imageId,
          userId: context.user.id as string,
        },
        data: {
          title: data.title,
          description: data.description,
          url: data.imageUrl,
          published: data.published,
          showPrivateToFollowers: data.showPrivateToFollowers,
        },
      });
    });
    return true;
  });

export const editImagesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    editImagesSchema.extend({
      albumId: z.string().optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.user.id as string;
    const inputtedImages = data.images ?? [];
    // update metadata of images picked from gallery
    if (inputtedImages.length > 0) {
      const updateEffects = inputtedImages.map((img) =>
        Effect.tryPromise(() =>
          db.image.update({
            where: { id: img.id },
            data: {
              url: img.url ?? '',
              title: img.title ?? '',
              description: img.description ?? '',
              published: data.published,
              showPrivateToFollowers: data.showPrivateToFollowers,
              userId: userId,
            },
          }),
        ),
      );

      const batchUpdateWorkflow = Effect.all(updateEffects, {
        concurrency: 10, // processes 10 updates at a time, if set to "unbounded" processes all updates concurrently
      });

      await Effect.runPromise(batchUpdateWorkflow);
    }
  });

export const removeImageFromAlbumFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
      albumId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.album.update({
        where: { id: data.albumId },
        data: {
          images: {
            disconnect: {
              id: data.imageId,
            },
          },
        },
      });
    });
    return true;
  });

export const deleteImageFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.delete({
        where: { id: data.imageId },
      });
    });
    return true;
  });

export const deleteImagesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageIds: z.array(z.string()),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      if (data.imageIds.length > 0) {
        await ctx.image.deleteMany({
          where: {
            id: { in: data.imageIds },
            userId: context.user.id as string,
          },
        });
      }
    });
    return true;
  });

export const setPrivateImageFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.update({
        where: { id: data.imageId },
        data: {
          published: false,
        },
      });
    });
    return true;
  });

export const setShowPrivateImageToFollowersFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.update({
        where: { id: data.imageId },
        data: {
          showPrivateToFollowers: true,
        },
      });
    });
    return true;
  });

export const setHidePrivateImageToFollowersFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.update({
        where: { id: data.imageId },
        data: {
          showPrivateToFollowers: false,
        },
      });
    });
    return true;
  });

export const setPublicImageFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      imageId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db.$transaction(async (ctx) => {
      await ctx.image.update({
        where: { id: data.imageId },
        data: {
          published: true,
        },
      });
    });
    return true;
  });
