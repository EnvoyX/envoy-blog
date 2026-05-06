import { createStore } from "@tanstack/react-store";

export const imageUploadModalStore = createStore({
  isDialogOpen: false,
  type: "",
});
