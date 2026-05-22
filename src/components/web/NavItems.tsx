import { linkOptions } from '@tanstack/react-router';
import {
  Check,
  Newspaper,
  UserIcon,
  MailboxIcon,
  ImagesIcon,
  AlbumIcon,
  UploadIcon,
  Settings2,
} from 'lucide-react';

import { NavPrimaryProps, NavProps } from '@/lib/types';

export const navItemsMain: NavProps['items'] = linkOptions([
  {
    title: 'Articles',
    to: '/article',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Blogs',
    to: '/blog',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Posts',
    to: '/post',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Chat',
    to: '/chat',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'About',
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
]);

export const navItemsDashboard: NavPrimaryProps['items'] = linkOptions([
  {
    title: 'Profile',
    icon: UserIcon,
    to: '/dashboard/profile',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Task Tracker',
    icon: Check,
    to: '/dashboard/task-tracker',
    activeOptions: {
      exact: false,
    },
  },

  {
    title: 'Blogs',
    icon: Newspaper,
    to: '/dashboard/blog',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Posts',
    icon: MailboxIcon,
    to: '/dashboard/post',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Upload Image',
    icon: UploadIcon,
    to: '/dashboard/image-upload',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Albums',
    icon: AlbumIcon,
    to: '/dashboard/albums',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Images',
    icon: ImagesIcon,
    to: '/dashboard/images',
    activeOptions: {
      exact: false,
    },
  },
]);
export const navSecondayItems: NavPrimaryProps['items'] = linkOptions([
  {
    title: 'Settings',
    to: '/dashboard/settings',
    icon: Settings2,
    activeOptions: {
      exact: true,
    },
  },
]);
export const sidebarNavItems: NavPrimaryProps['items'] = linkOptions([
  {
    title: 'Profile',
    icon: UserIcon,
    to: '/dashboard/profile',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Task Tracker',
    icon: Check,
    to: '/dashboard/task-tracker',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Blogs',
    icon: Newspaper,
    to: '/dashboard/blog',
    activeOptions: {
      exact: false,
    },
  },
]);
