import { queryOptions } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';

import { getAlbumByIdFn, getAlbumsFn } from '../album';
import { getMyPostsFn, getPostFn } from '../blog';
import { getImagesFn } from '../image';
import { getShortPostsFn } from '../post';
import { fetchCurrentQuranProgressFn } from '../quran-tracker';
import { getProfileData } from '../session';
import { getUserSettings } from '../settings';
import { fetchTaskListsFn } from '../task-tracker';

export function profileOptions() {
  return queryOptions({
    queryKey: ['profile-dashboard'],
    queryFn: async () => {
      const data = await getProfileData();
      return data.user;
    },
  });
}

export function quranTrackerOptions() {
  return queryOptions({
    queryKey: ['quran-tracker'],
    queryFn: async () => {
      const data = await fetchCurrentQuranProgressFn();
      return data;
    },
  });
}

export function taskTrackerOptions() {
  return queryOptions({
    queryKey: ['task-tracker-lists'],
    queryFn: fetchTaskListsFn,
  });
}

export function imageGalleryOptions() {
  return queryOptions({
    queryKey: ['image-gallery'],
    queryFn: async () => {
      const images = await getImagesFn();
      return images;
    },
  });
}

export function dashboardAlbumsOptions() {
  return queryOptions({
    queryKey: ['dashboard-albums'],
    queryFn: async () => {
      const albums = await getAlbumsFn();
      return albums;
    },
  });
}

export function dashboardAlbumIdOptions(albumId: string) {
  return queryOptions({
    queryKey: ['album-gallery', albumId],
    queryFn: async () => {
      const album = await getAlbumByIdFn({
        data: {
          albumId: albumId,
        },
      });
      if (!album) {
        throw redirect({ to: '/dashboard/albums' });
      }
      return album;
    },
  });
}

export function dashboardBlogPostsOptions() {
  return queryOptions({
    queryKey: ['dashboard-blog-posts'],
    queryFn: async () => {
      const allPosts = await getMyPostsFn();
      return allPosts;
    },
  });
}

export function dashboardBlogPostSlugOptions(slug: string) {
  return queryOptions({
    queryKey: ['dashboard-blog-post', slug],
    queryFn: async () => {
      const post = await getPostFn({ data: slug });
      return post;
    },
  });
}

export function dashboardShortPostsOptions() {
  return queryOptions({
    queryKey: ['dashboard-short-posts'],
    queryFn: async () => {
      const allPosts = await getShortPostsFn();
      return allPosts;
    },
  });
}

export function dashboardUserPreferences() {
  return queryOptions({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const userPreferences = await getUserSettings();
      return {
        userPreferences,
      };
    },
  });
}
