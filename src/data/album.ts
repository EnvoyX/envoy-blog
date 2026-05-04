import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "@/lib/db";
import { authMiddleware } from "@/middlewares/auth";
import { imageSchema } from "@/schemas/image";

export const getAlbumsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.album.findMany({
      where: { authorId: context.user.id },
      include: {
        author: true,
        images: true,
        _count: { select: { images: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

export const getAlbumByIdFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      albumId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    return await db.album.findUnique({
      where: { id: data.albumId, authorId: context.user.id },
      include: {
        author: true,
        images: true,
        _count: { select: { images: true } },
      },
    });
  });

export const ImportImagesToAlbumFn = createServerFn({ method: "POST" })
  .inputValidator(imageSchema.extend({ albumId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      const createdImages = await ctx.image.createManyAndReturn({
        data: data.image.map((img) => ({
          userId: context.user.id as string,
          url: img.url,
          title: img.title,
          description: img.description,
          published: data.published,
        })),
      });
      await ctx.album.update({
        where: { id: data.albumId, authorId: context.user.id as string },
        data: {
          images: { connect: createdImages.map((img) => ({ id: img.id })) },
          updatedAt: new Date(),
        },
      });
    });
    return true;
  });

export const addExistingImagesToAlbumFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      albumId: z.string(),
      imageIds: z.array(z.string()),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.$transaction(async (ctx) => {
      if (data.imageIds.length > 0) {
        await ctx.album.update({
          where: {
            id: data.albumId,
            authorId: context.user.id,
          },
          data: {
            images: {
              connect: data.imageIds.map((id) => ({ id })),
            },
          },
        });
      }
    });
    return true;
  });

export const createAlbumFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string(),
      description: z.string(),
      coverImageUrl: z.string(),
      published: z.boolean(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.album.create({
      data: {
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        published: data.published,
        authorId: context.user.id as string,
      },
    });
  });

export const editAlbumFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      albumId: z.string(),
      name: z.string(),
      description: z.string(),
      coverImageUrl: z.string(),
      published: z.boolean(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.album.update({
      where: { id: data.albumId, authorId: context.user.id },
      data: {
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        published: data.published,
        authorId: context.user.id as string,
      },
    });
  });

export const deleteAlbumFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      albumId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.album.delete({
      where: { id: data.albumId, authorId: context.user.id },
    });
  });
