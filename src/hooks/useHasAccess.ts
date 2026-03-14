import { useMenuStore } from "@/stores/menuStore";
import type { IMenu } from "@/types/menu";
import { useLocation } from "react-router-dom";

// Fungsi helper dicabut ke luar supaya tidak didefinisikan ulang setiap render
const findMenuByUrl = (menus: IMenu[], url: string): IMenu | undefined => {
  for (const menu of menus) {
    // Cocokkan URL persis atau prefix seperti /users/create cocok ke /users
    if (url === menu.url || url.startsWith(menu.url + "/")) return menu;
    if (menu.children) {
      const found = findMenuByUrl(menu.children, url);
      if (found) return found;
    }
  }
  return undefined;
};

function useHasAccess(access: "C" | "R" | "U" | "D"): boolean {
  const menus = useMenuStore((state) => state.menus);
  const location = useLocation();

  const currentMenu = findMenuByUrl(menus, location.pathname);
  // Cek apakah akses ada di properti access menu
  return currentMenu?.access?.includes(access) ?? false;
}

export default useHasAccess;
