import { LucideIcon } from 'lucide-react';

import { Prisma } from '@/generated/prisma/client';

export interface NavPrimaryProps {
  items: {
    title: string;
    to: string;
    icon: LucideIcon;
    activeOptions: {
      exact: boolean;
    };
  }[];
}

export interface NavProps {
  items: {
    title: string;
    to: string;
    activeOptions: {
      exact: boolean;
    };
  }[];
}

export type ShortPostPublic = Prisma.ShortPostGetPayload<{
  include: {
    _count: { select: { likes: true; comments: true } };
    likes: true;
    comments: {
      include: {
        user: true;
      };
    };
    author: true;
    imagesOnShortPosts: {
      include: {
        image: true;
      };
    };
  };
}>;

export type BlogPostPublic = Prisma.PostGetPayload<{
  include: {
    author: true;
    comments: {
      include: { user: true };
      orderBy: { createdAt: 'desc' };
    };
    _count: {
      select: { likes: true; comments: true };
    };
    likes: true;
  };
}>;

export type BlogPostUserPublic = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: true;
    comments: {
      include: { user: true };
    };
    _count: {
      select: { likes: true; comments: true };
    };
  };
}>;

export type AlbumPrisma = Prisma.AlbumGetPayload<{
  include: {
    author: true;
    images: true;
    _count: { select: { images: true } };
  };
}>;
