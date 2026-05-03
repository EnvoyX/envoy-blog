import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "@/lib/db";
import { authMiddleware } from "@/middlewares/auth";

export const getImagesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: "desc" },
    });
  });

export const getImagesWithAlbumsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        albums: true,
        user: true,
      },
    });
  });

export const getPublicImagesFn = createServerFn({ method: "GET" }).handler(async () => {
  return await db.image.findMany({
    where: { shortPost: { published: true } },
    orderBy: { createdAt: "desc" },
  });
});

export const getImagesByIdFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    return await db.image.findMany({
      where: { userId: data.userId },
      orderBy: { createdAt: "desc" },
    });
  });

export const ImportImagesFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      published: z.boolean(),
      images: z.array(z.string()),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      if (!data.images?.length) return;
      if (data.images) {
        await ctx.image.createMany({
          data: data.images.map((image) => ({
            userId: context.user.id as string,
            url: image,
            published: data.published,
          })),
        });
      }
    });
    return true;
  });

export const ImportImageToAlbumFn = createServerFn({ method: "POST" })
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

export const ImportImagesToAlbumFn = createServerFn({ method: "POST" })
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

export const DeleteImageFn = createServerFn({ method: "POST" })
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

export const SetPrivateImageFn = createServerFn({ method: "POST" })
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

export const SetPublicImageFn = createServerFn({ method: "POST" })
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
