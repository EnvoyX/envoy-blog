import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

interface SidebarMobileState {
  isSidebarMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  toggleSheet: (open: boolean) => void;
}

export const useSidebarStore = create(
  persist(
    combine({ isSidebarOpen: false }, (set) => ({
      toggleSidebar: (open: boolean) => set(() => ({ isSidebarOpen: open })),
    })),
    { name: 'sidebar-chat-storage' }, // this remembers if the user left it open/closed
  ),
);

export const useSidebarMobileStore = create<SidebarMobileState>()(
  persist(
    (set) => ({
      isSidebarMobileOpen: false,
      toggleMobileSidebar: () =>
        set((state) => ({ isSidebarMobileOpen: !state.isSidebarMobileOpen })),
      toggleSheet: (open: boolean) => set(() => ({ isSidebarMobileOpen: !open })),
    }),
    { name: 'sidebar-mobile-chat-storage' }, // this remembers if the user left it open/closed
  ),
);
