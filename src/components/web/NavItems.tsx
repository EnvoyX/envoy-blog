import { linkOptions } from "@tanstack/react-router";
import {
  BookMarkedIcon,
  BookmarkIcon,
  Check,
  Compass,
  Import,
  LayoutDashboardIcon,
  Newspaper,
  UserIcon,
  MailboxIcon,
  ImagesIcon,
  AlbumIcon,
  UploadIcon,
} from "lucide-react";

import { NavPrimaryProps, NavProps } from "@/lib/types";

export const navItemsMain: NavProps["items"] = linkOptions([
  {
    title: "Articles",
    to: "/article",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Blogs",
    to: "/blog",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Posts",
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
]);

export const navItemsDashboard: NavPrimaryProps["items"] = linkOptions([
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    to: "/dashboard",
    activeOptions: {
      exact: true,
    },
  },
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
    title: "Qur'an Tracker",
    icon: BookMarkedIcon,
    to: "/dashboard/quran-tracker",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Blogs",
    icon: Newspaper,
    to: "/dashboard/blog",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Posts",
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
  {
    title: "Items",
    icon: BookmarkIcon,
    to: "/dashboard/items",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Import",
    icon: Import,
    to: "/dashboard/import",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Discover",
    icon: Compass,
    to: "/dashboard/discover",
    activeOptions: {
      exact: false,
    },
  },
]);
export const sidebarNavItems: NavPrimaryProps["items"] = linkOptions([
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    to: "/dashboard",
    activeOptions: {
      exact: true,
    },
  },
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
    title: "Qur'an Tracker",
    icon: BookMarkedIcon,
    to: "/dashboard/quran-tracker",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Blogs",
    icon: Newspaper,
    to: "/dashboard/blog",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Items",
    icon: BookmarkIcon,
    to: "/dashboard/items",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Import",
    icon: Import,
    to: "/dashboard/import",
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Discover",
    icon: Compass,
    to: "/dashboard/discover",
    activeOptions: {
      exact: false,
    },
  },
]);
