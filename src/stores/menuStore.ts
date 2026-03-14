import type { IMenu } from "@/types/menu";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MenuState {
  menus: IMenu[];
  setMenus: (menus: IMenu[]) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      menus: [],
      setMenus: (menus) => set({ menus }),
    }),
    {
      name: "menu-storage",
    }
  )
);
