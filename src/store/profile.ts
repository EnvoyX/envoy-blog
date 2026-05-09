import { createStore } from "@tanstack/react-store";

export const followDialogStore = createStore<{
  isOpen: boolean;
  initialTab: "followers" | "following";
  currentUserId: string;
}>({
  isOpen: false,
  initialTab: "followers",
  currentUserId: "",
});
