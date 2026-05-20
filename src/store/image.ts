import { create } from 'zustand';
import { persist, combine } from 'zustand/middleware';

export const useImageStore = create(
  persist(
    combine(
      {
        postId: '',
        isImportToAlbumModalOpen: false,
        isBulkImageDialogOpen: false,
        isBulkEditDialogOpen: false,
        isEditDialogOpen: false,
        isCounterVisible: true,
        isCaptionVisible: false,
        imageId: '',
        imageUrl: '',
        albumId: '',
        bulkMode: '' as 'add' | 'remove' | 'delete' | 'edit' | null,
        initialValues: null as {
          title: string;
          description: string;
          published: boolean;
          albumId?: string;
          showPrivateToFollowers?: boolean;
        } | null,
      },
      (set) => ({
        toggleDialog: (
          dialog: 'open' | 'bulk-delete' | 'bulk-edit' | 'edit' | 'close',
          imageId?: string,
          imageUrl?: string,
          albumId?: string,
        ) =>
          set(() => {
            if (dialog === 'open') {
              return {
                isBulkImageDialogOpen: false,
                isImportToAlbumModalOpen: true,
                isBulkEditDialogOpen: false,
                isEditDialogOpen: false,
                imageId: imageId,
                imageUrl: imageUrl,
                bulkMode: null,
                albumId: '',
              };
            } else if (dialog === 'bulk-delete') {
              return {
                isBulkImageDialogOpen: true,
                isImportToAlbumModalOpen: false,
                isBulkEditDialogOpen: false,
                isEditDialogOpen: false,
                imageId: '',
                imageUrl: '',
                bulkMode: 'delete',
                albumId: '',
              };
            } else if (dialog === 'bulk-edit') {
              return {
                isBulkImageDialogOpen: false,
                isImportToAlbumModalOpen: false,
                isBulkEditDialogOpen: true,
                isEditDialogOpen: false,
                imageId: '',
                imageUrl: '',
                bulkMode: 'edit',
                albumId: albumId,
              };
            } else if (dialog === 'edit') {
              return {
                isBulkImageDialogOpen: false,
                isImportToAlbumModalOpen: false,
                isBulkEditDialogOpen: false,
                isEditDialogOpen: true,
                imageId: imageId,
                imageUrl: imageUrl,
                bulkMode: null,
                albumId: '',
              };
            } else if (dialog === 'close') {
              return {
                isBulkImageDialogOpen: false,
                isImportToAlbumModalOpen: false,
                isBulkEditDialogOpen: false,
                isEditDialogOpen: false,
                imageId: '',
                imageUrl: '',
                bulkMode: null,
                albumId: '',
              };
            } else {
              return {
                imageId: '',
                isBulkImageDialogOpen: false,
                isImportToAlbumModalOpen: false,
                isBulkEditDialogOpen: false,
                isEditDialogOpen: false,
                imageUrl: '',
                bulkMode: null,
                albumId: '',
              };
            }
          }),
        onOpenChangeDialog: (
          dialog: 'open' | 'bulk-delete' | 'bulk-edit' | 'edit',
          open: boolean,
        ) =>
          set(() => {
            if (dialog === 'open') {
              return { isImportToAlbumModalOpen: open };
            } else if (dialog === 'bulk-delete') {
              return { isBulkImageDialogOpen: open };
            } else if (dialog === 'bulk-edit') {
              return { isBulkEditDialogOpen: open };
            } else if (dialog === 'edit') {
              return { isEditDialogOpen: open };
            } else {
              return {
                isImportToAlbumModalOpen: false,
                isBulkImageDialogOpen: false,
                isEditDialogOpen: false,
              };
            }
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
