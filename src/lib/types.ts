import { Prisma } from "@/generated/prisma/client";
import { LucideIcon } from "lucide-react";

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
    Images: true;
  };
}>;
