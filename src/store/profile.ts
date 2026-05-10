import { createStore } from "@tanstack/react-store";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export const followDialogStore = createStore<{
  isOpen: boolean;
  initialTab: "followers" | "following";
  currentUserId: string;
}>({
  isOpen: false,
  initialTab: "followers",
  currentUserId: "",
});

export const useProfileStore = create(
  persist(
    combine(
      {
        viewPrivate: true,
        lastViewedTab: "",
      },
      (set) => ({
        toggleViewPrivate: () => set((prev) => ({ viewPrivate: !prev.viewPrivate })),
        setLastViewedTab: (value: "blogs" | "posts" | "images" | "albums") =>
          set(() => ({ lastViewedTab: value })),
      }),
    ),
    {
      name: "profile-store",
    },
  ),
);
