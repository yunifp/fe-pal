import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";

import { useMenuStore } from "@/stores/menuStore";
import RenderSidebarItems from "./RenderSidebarItems";

const AppSidebar = () => {
  const items = useMenuStore((state) => state.menus);

  const mergedItems = [...items];

  return (
    <Sidebar>
      <SidebarContent
        className="relative bg-cover bg-center font-inter"
        style={{ backgroundImage: "url('/images/sawit.jpg')" }}>
        {/* overlay hitam transparan */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* konten sidebar */}
        <div className="relative z-10">
          <div className="p-4 flex items-center justify-center">
            <div className="bg-white shadow-sm rounded-lg p-3">
              <img
                src="/images/Ditjenbun.png"
                alt="Brand Logo"
                className="h-18 w-auto"
              />
            </div>
          </div>

          <SidebarMenu>
            <RenderSidebarItems items={mergedItems} />
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
