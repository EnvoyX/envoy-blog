import { createStore } from "@tanstack/react-store";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export const postModalStore = createStore({
  dialogId: "",
  isOpen: false,
  isDeletePostDialog: false,
  isLoading: false,
  currentPostId: "",
  initialValues: {
    images: [] as { id: string; url: string; title: string; description: string }[],
    content: "",
    published: false,
    showPrivateToFollowers: false,
    currentPostId: "",
    mode: "",
  },
});

export const usePostStore = create(
  persist(
    combine(
      {
        lastViewedTab: "",
      },
      (set) => ({
        setLastViewedTab: (value: "latest-post" | "for-you" | "following-post") =>
          set(() => ({ lastViewedTab: value })),
      }),
    ),
    {
      name: "post-storage",
    },
  ),
);
