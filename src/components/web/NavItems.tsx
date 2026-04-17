import { NavPrimaryProps, NavProps } from '@/lib/types'
import { linkOptions } from '@tanstack/react-router'
import {
  BookMarkedIcon,
  BookmarkIcon,
  Check,
  Compass,
  Gamepad2,
  Import,
  LayoutDashboardIcon,
  Newspaper,
  UserIcon,
} from 'lucide-react'

export const navItemsMain: NavProps['items'] = linkOptions([
    {
      title: 'Blog',
      to: '/blog',
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
  ])

export const navItemsDashboard: NavPrimaryProps['items'] = linkOptions([
  {
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    to: '/dashboard',
    activeOptions: {
      exact: true,
    },
  },
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
    title: "Qur'an Tracker",
    icon: BookMarkedIcon,
    to: '/dashboard/quran-tracker',
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
    title: 'Items',
    icon: BookmarkIcon,
    to: '/dashboard/items',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Import',
    icon: Import,
    to: '/dashboard/import',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Discover',
    icon: Compass,
    to: '/dashboard/discover',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Tic Tac Toe',
    icon: Gamepad2,
    to: '/dashboard/tic-tac-toe',
    activeOptions: {
      exact: true,
    },
  },
])
export const sidebarNavItems: NavPrimaryProps['items'] = linkOptions([
    {
      title: 'Dashboard',
      icon: LayoutDashboardIcon,
      to: '/dashboard',
      activeOptions: {
        exact: true,
      },
    },
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
      title: "Qur'an Tracker",
      icon: BookMarkedIcon,
      to: '/dashboard/quran-tracker',
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
      title: 'Items',
      icon: BookmarkIcon,
      to: '/dashboard/items',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Import',
      icon: Import,
      to: '/dashboard/import',
      activeOptions: {
        exact: false,
      },
    },
    {
      title: 'Discover',
      icon: Compass,
      to: '/dashboard/discover',
      activeOptions: {
        exact: false,
      },
    },
  ])


