import { create } from "zustand";
import { persist, combine } from "zustand/middleware";

// with combine (the type is inferred automatically from the initial state and the stateCreator)
export const useAlbumStore = create(
  persist(
    combine(
      {
        currentAlbumId: "",
        isAlbumDialogOpen: false,
        isDeleteDialogOpen: false,
        isImageImportDialogOpen: false,
        initialValues: null as {
          name: string;
          description: string;
          published: boolean;
          coverImageUrl: string;
          type: "create" | "edit";
        } | null,
      },
      (set) => ({
        toggleDialog: (dialog: "open" | "import" | "delete" | "close", albumId?: string) =>
          set(() => {
            switch (dialog) {
              case "open":
                return {
                  currentAlbumId: albumId ?? "",
                  isImageImportDialogOpen: false,
                  isDeleteDialogOpen: false,
                  isAlbumDialogOpen: true,
                };
              case "import":
                return {
                  currentAlbumId: albumId ?? "",
                  isImageImportDialogOpen: true,
                  isDeleteDialogOpen: false,
                  isAlbumDialogOpen: false,
                };
              case "delete":
                return {
                  currentAlbumId: albumId ?? "",
                  isImageImportDialogOpen: false,
                  isAlbumDialogOpen: false,
                  isDeleteDialogOpen: true,
                };
              case "close":
                return {
                  currentAlbumId: "",
                  isImageImportDialogOpen: false,
                  isAlbumDialogOpen: false,
                  isDeleteDialogOpen: false,
                };
            }
          }),
        onOpenDialogChange: (dialog: "open" | "import" | "delete", open: boolean) =>
          set(() => {
            if (dialog === "open") {
              return {
                isAlbumDialogOpen: open,
              };
            } else if (dialog === "import") {
              return {
                isImageImportDialogOpen: open,
              };
            } else if (dialog === "delete") {
              return {
                isDeleteDialogOpen: open,
              };
            } else {
              return {
                isCreateDialogOpen: false,
                isEditDialogOpen: false,
                isDeleteDialogOpen: false,
              };
            }
          }),
        setInitialValues: (
          initialValues: {
            name: string;
            description: string;
            published: boolean;
            coverImageUrl: string;
            type: "create" | "edit";
          } | null,
        ) => {
          set({
            initialValues: {
              name: initialValues ? initialValues.name : "",
              description: initialValues ? initialValues.description : "",
              published: initialValues ? initialValues.published : false,
              coverImageUrl: initialValues ? initialValues.coverImageUrl : "",
              type: initialValues ? initialValues.type : "create",
            },
          });
        },
      }),
    ),
    {
      name: "album-dialog-storage",
      partialize: (state) => ({
        // only persist these, skip initialValues
        currentAlbumId: state.currentAlbumId,
        isAlbumDialogOpen: state.isAlbumDialogOpen,
        isDeleteDialogOpen: state.isDeleteDialogOpen,
        isImageImportDialogOpen: state.isImageImportDialogOpen,
      }),
    },
  ),
);

// Without combine (you need to define the type and each state field manually)

interface AlbumDialogState {
  currentAlbumId: string;
  isCreateDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  toggleDialog: (dialog: "open" | "delete" | "close", albumId?: string) => void;
  onOpenDialogChange: (dialog: "open" | "delete", open: boolean) => void;
}

export const useAlbumStoreV1 = create<AlbumDialogState>()(
  persist(
    (set) => ({
      currentAlbumId: "",
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      toggleDialog: (dialog: "open" | "delete" | "close", albumId?: string) =>
        set(() => {
          switch (dialog) {
            case "open":
              return {
                currentAlbumId: albumId ?? "",
                isDeleteDialogOpen: false,
                isAlbumDialogOpen: true,
              };

            case "delete":
              return {
                currentAlbumId: albumId ?? "",
                isAlbumDialogOpen: false,
                isDeleteDialogOpen: true,
              };
            case "close":
              return {
                currentAlbumId: "",
                isAlbumDialogOpen: false,
                isDeleteDialogOpen: false,
              };
          }
        }),
      onOpenDialogChange: (dialog: "open" | "delete", open: boolean) =>
        set(() => {
          if (dialog === "open") {
            return {
              isAlbumDialogOpen: open,
            };
          } else if (dialog === "delete") {
            return {
              isDeleteDialogOpen: open,
            };
          } else {
            return {
              isCreateDialogOpen: false,
              isEditDialogOpen: false,
              isDeleteDialogOpen: false,
            };
          }
        }),
    }),
    { name: "album-dialog-storage" }, // this remembers if the user left it open/closed
  ),
);
