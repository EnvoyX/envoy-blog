import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const usePostStore = create(
  persist(
    combine(
      {
        dialogId: '',
        isOpen: false,
        isDeletePostDialog: false,
        currentPostId: '',
        initialValues: null as {
          images: { id?: string; url: string; title: string; description: string }[] | null;
          content: string;
          published: boolean;
          showPrivateToFollowers: boolean;
          currentPostId: string;
          mode: 'create' | 'edit';
        } | null,
      },
      (set) => ({
        toggleDialog: (dialog: 'open' | 'delete' | 'close', currentPostId?: string) =>
          set(() => {
            switch (dialog) {
              case 'open':
                return {
                  currentPostId: currentPostId ?? '',
                  isOpen: true,
                  isDeletePostDialog: false,
                };
              case 'delete':
                return {
                  currentPostId: currentPostId ?? '',
                  isOpen: true,
                  isDeletePostDialog: true,
                };
              case 'close':
                return {
                  currentPostId: currentPostId ?? '',
                  isOpen: false,
                  isDeletePostDialog: false,
                };
            }
          }),
        onOpenDialogChange: (dialog: 'open' | 'delete', open: boolean) =>
          set(() => {
            if (dialog === 'open') {
              return {
                isOpen: open,
              };
            } else if (dialog === 'delete') {
              return {
                isDeletePostDialog: open,
              };
            } else {
              return {
                isOpen: false,
                isDeletePostDialog: false,
              };
            }
          }),
        setInitialValues: (
          initialValues: {
            images: { id?: string; url: string; title: string; description: string }[];
            content: string;
            published: boolean;
            showPrivateToFollowers: boolean;
            currentPostId: string;
            mode: 'create' | 'edit';
          } | null,
        ) => {
          set({
            initialValues: {
              images: initialValues ? initialValues.images : null,
              content: initialValues ? initialValues.content : '',
              published: initialValues ? initialValues.published : false,
              showPrivateToFollowers: initialValues ? initialValues.showPrivateToFollowers : false,
              currentPostId: initialValues ? initialValues.currentPostId : '',
              mode: initialValues ? initialValues.mode : 'create',
            },
          });
        },
      }),
    ),
    {
      name: 'post-storage',
    },
  ),
);
