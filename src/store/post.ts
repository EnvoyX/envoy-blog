import { createStore } from "@tanstack/react-store";

export const postModalStore = createStore({
  dialogId: "",
  isOpen: false,
  isDeletePostDialog: false,
  isLoading: false,
  currentPostId: "",
  initialValues: {
    images: [] as string[],
    content: "",
    published: false,
    showPrivateToFollowers: false,
    currentPostId: "",
    mode: "",
  },
});
