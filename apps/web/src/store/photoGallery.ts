import { createStore } from "@tanstack/react-store";

export const photoGalleryStore = createStore({
  isOpen: false,
  photoId: "",
  albumId: "",
});