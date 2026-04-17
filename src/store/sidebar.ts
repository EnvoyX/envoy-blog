import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

interface SidebarMobileState {
  isSidebarMobileOpen: boolean
  toggleMobileSidebar: () => void
  toggleSheet: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    { name: 'sidebar-chat-storage' }, // this remembers if the user left it open/closed
  ),
)

export const useSidebarMobileStore = create<SidebarMobileState>()(
  persist(
    (set) => ({
      isSidebarMobileOpen: false,
      toggleMobileSidebar: () =>
        set((state) => ({ isSidebarMobileOpen: !state.isSidebarMobileOpen })),
      toggleSheet: (open: boolean) =>
        set(() => ({ isSidebarMobileOpen: !open })),
    }),
    { name: 'sidebar-mobile-chat-storage' }, // this remembers if the user left it open/closed
  ),
)
