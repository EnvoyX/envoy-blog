import { linkOptions } from "@tanstack/react-router";
import {
  Check,
  Newspaper,
  UserIcon,
  MailboxIcon,
  ImagesIcon,
  AlbumIcon,
  UploadIcon,
  Settings2,
  BookMarkedIcon,
  Key,
} from "lucide-react";

import { NavPrimaryProps, NavProps } from "@/lib/types";

export const navItemsMain: NavProps["items"] = linkOptions([
  {
    title: "Blog",
    to: "/blog",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Posts",
    to: "/posts",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Post",
    to: "/post",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Chat",
    to: "/chat",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "About",
    to: "/about",
    activeOptions: {
      exact: false,
    },
  },
]);

export const navItemsDashboard: NavPrimaryProps["items"] = linkOptions([
  {
    title: "Profile",
    icon: UserIcon,
    to: "/dashboard/profile",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Task Tracker",
    icon: Check,
    to: "/dashboard/task-tracker",
    activeOptions: {
      exact: false,
    },
  },

  {
    title: "Blog",
    icon: Newspaper,
    to: "/dashboard/blog",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Post",
    icon: MailboxIcon,
    to: "/dashboard/post",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Upload Image",
    icon: UploadIcon,
    to: "/dashboard/image-upload",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Albums",
    icon: AlbumIcon,
    to: "/dashboard/albums",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Images",
    icon: ImagesIcon,
    to: "/dashboard/images",
    activeOptions: {
      exact: false,
    },
  },
]);
export const navSecondayItems: NavPrimaryProps["items"] = linkOptions([
  {
    title: "Settings",
    to: "/dashboard/settings",
    icon: Settings2,
    activeOptions: {
      exact: true,
    },
  },
]);

export const navItemsAdmin: NavPrimaryProps["items"] = linkOptions([
  {
    title: "Admin Panel",
    icon: Key,
    to: "/dashboard/admin",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: `Qur'an Tracker`,
    icon: BookMarkedIcon,
    to: "/dashboard/quran-tracker",
    activeOptions: {
      exact: false,
    },
  },
]);
