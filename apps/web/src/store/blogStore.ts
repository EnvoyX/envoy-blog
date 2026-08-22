import { createStore } from "@tanstack/react-store";

export const modalStore = createStore({
  dialogId: "",
  isOpen: false,
  isLoading: false,
});
