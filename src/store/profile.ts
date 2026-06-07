import { createStore } from '@tanstack/react-store';
import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const followDialogStore = createStore<{
  isOpen: boolean;
  isConfirmDialogOpen: boolean;
  isLoading: boolean;
  initialTab: 'followers' | 'following';
  currentUserId: string;
  confirmData: {
    followId: string;
    followerId: string;
    followerImage: string;
    followerName: string;
    followerEmail: string;
  };
}>({
  isOpen: false,
  isConfirmDialogOpen: false,
  isLoading: false,
  initialTab: 'followers',
  currentUserId: '',
  confirmData: {
    followId: '',
    followerId: '',
    followerImage: '',
    followerName: '',
    followerEmail: '',
  },
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
