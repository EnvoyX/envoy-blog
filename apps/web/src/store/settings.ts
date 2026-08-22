import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export const useSettingStore = create(
  persist(
    combine(
      {
        ImgbbAPIKey: "",
      },
      (set) => ({
        saveKey: (apiKey: string) =>
          set(() => ({
            ImgbbAPIKey: apiKey,
          })),
      }),
    ),
    {
      name: "settings-storage",
    },
  ),
);
