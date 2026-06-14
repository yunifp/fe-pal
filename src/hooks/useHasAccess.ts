import { useMenuStore } from "@/stores/menuStore";
import type { IMenu } from "@/types/menu";
import { useLocation } from "react-router-dom";

// Fungsi helper dicabut ke luar supaya tidak didefinisikan ulang setiap render
const findMenuByUrl = (menus: IMenu[], url: string): IMenu | undefined => {
  for (const menu of menus) {
    // 1. Cocokkan URL persis (Prioritas Utama)
    if (url === menu.url) {
      return menu;
    }

    // 2. Cocokkan Prefix (berguna untuk sub-halaman seperti /users/create)
    // WAJIB memastikan menu.url ada nilainya, bukan string kosong "", dan bukan "/"
    // Mencegah bug false-positive dimana "" + "/" menjadi "/" yang cocok dengan semua URL
    if (
      menu.url && 
      menu.url.trim() !== "" && 
      menu.url !== "/" && 
      url.startsWith(menu.url + "/")
    ) {
      return menu;
    }

    // 3. Lanjutkan pencarian ke children (anak menu) secara rekursif
    if (menu.children && menu.children.length > 0) {
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
  
  // Jika menu tidak ditemukan di list (misal di-uncheck dari RBAC backend),
  // otomatis akan mereturn false dan user ditendang ke /not-authorized
  return currentMenu?.access?.includes(access) ?? false;
}

export default useHasAccess;