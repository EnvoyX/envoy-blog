import { create } from "zustand";
import { persist, combine } from "zustand/middleware";

export const useImageStore = create(
  persist(
    combine(
      {
        isImportToAlbumModalOpen: false,
        imageId: "",
        imageUrl: "",
      },
      (set) => ({
        toggleDialog: (dialog: "open" | "close", imageId?: string, imageUrl?: string) =>
          set(() => {
            if (dialog === "open") {
              return {
                isImportToAlbumModalOpen: true,
                imageId: imageId,
                imageUrl: imageUrl,
              };
            } else if (dialog === "close") {
              return {
                isImportToAlbumModalOpen: false,
                imageId: "",
                imageUrl: "",
              };
            }
            return {
              imageId: "",
              isImportToAlbumModalOpen: false,
              imageUrl: "",
            };
          }),
        onOpenChangeDialog: (dialog: "open", open: boolean) =>
          set(() => {
            if (dialog === "open") {
              return { isImportToAlbumModalOpen: open };
            }
            return {
              isImportToAlbumModalOpen: false,
            };
          }),
      }),
    ),
    {
      name: "image-store-storage",
    },
  ),
);
