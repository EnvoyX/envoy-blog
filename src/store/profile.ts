import { createStore } from '@tanstack/react-store';
import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const followDialogStore = createStore<{
  isOpen: boolean;
  initialTab: 'followers' | 'following';
  currentUserId: string;
}>({
  isOpen: false,
  initialTab: 'followers',
  currentUserId: '',
});

export const useProfileStore = create(
  persist(
    combine(
      {
        viewMode: '' as 'public' | 'all' | 'showToFollowers',
        lastViewedTab: '',
      },
      (set) => ({
        toggleViewMode: (mode: 'public' | 'all' | 'showToFollowers') =>
          set(() => ({ viewMode: mode })),
        setLastViewedTab: (value: 'blogs' | 'posts' | 'images' | 'albums') =>
          set(() => ({ lastViewedTab: value })),
      }),
    ),
    {
      name: 'profile-store',
    },
  ),
);
