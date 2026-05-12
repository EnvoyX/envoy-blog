import { create } from 'zustand';
import { persist, combine } from 'zustand/middleware';

export const useImageStore = create(
  persist(
    combine(
      {
        postId: '',
        isImportToAlbumModalOpen: false,
        isEditDialogOpen: false,
        isCounterVisible: true,
        isCaptionVisible: false,
        imageId: '',
        imageUrl: '',
        initialValues: null as {
          title: string;
          description: string;
          published: boolean;
          albumId?: string;
          showPrivateToFollowers?: boolean;
        } | null,
      },
      (set) => ({
        toggleDialog: (dialog: 'open' | 'edit' | 'close', imageId?: string, imageUrl?: string) =>
          set(() => {
            if (dialog === 'open') {
              return {
                isImportToAlbumModalOpen: true,
                isEditDialogOpen: false,
                imageId: imageId,
                imageUrl: imageUrl,
              };
            }
            if (dialog === 'edit') {
              return {
                isImportToAlbumModalOpen: false,
                isEditDialogOpen: true,
                imageId: imageId,
                imageUrl: imageUrl,
              };
            } else if (dialog === 'close') {
              return {
                isImportToAlbumModalOpen: false,
                isEditDialogOpen: false,
                imageId: '',
                imageUrl: '',
              };
            }
            return {
              imageId: '',
              isImportToAlbumModalOpen: false,
              isEditDialogOpen: false,
              imageUrl: '',
            };
          }),
        onOpenChangeDialog: (dialog: 'open' | 'edit', open: boolean) =>
          set(() => {
            if (dialog === 'open') {
              return { isImportToAlbumModalOpen: open };
            }
            if (dialog === 'edit') {
              return { isEditDialogOpen: open };
            }
            return {
              isImportToAlbumModalOpen: false,
            };
          }),
        toggleCounter: () =>
          set((prev) => ({
            isCounterVisible: !prev.isCounterVisible,
          })),
        toggleCaptions: () =>
          set((prev) => ({
            isCaptionVisible: !prev.isCaptionVisible,
          })),
        setInitialValues: (
          initialValues: {
            title: string;
            description: string;
            albumId: string;
            published: boolean;
            showPrivateToFollowers: boolean;
          } | null,
        ) => {
          set({
            initialValues: {
              title: initialValues ? initialValues.title : '',
              description: initialValues ? initialValues.description : '',
              published: initialValues ? initialValues.published : false,
              albumId: initialValues ? initialValues.albumId : '',
              showPrivateToFollowers: initialValues ? initialValues.showPrivateToFollowers : false,
            },
          });
        },
        setPostId: (postId: string) => set(() => ({ postId })),
      }),
    ),
    {
      name: 'image-store-storage',
    },
  ),
);
