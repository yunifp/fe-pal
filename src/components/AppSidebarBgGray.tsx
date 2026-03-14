import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDown } from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import { clsx } from "clsx";
import { useMenuStore } from "@/stores/menuStore";
import DynamicIcon from "./DynamicIcon";

const AppSidebarBgGray = () => {
  const location = useLocation();
  const items = useMenuStore((state) => state.menus);

  return (
    <Sidebar>
      <SidebarContent className="bg-gray-100">
        <div className="p-4 flex items-center justify-center gap-1">
          <img src="/vite.svg" alt="Brand Logo" className="h-8 w-auto" />
        </div>

        <SidebarMenu>
          {items.map((item) =>
            item.children && item.children.length > 0 ? (
              <Collapsible key={item.nama} className="group">
                <SidebarMenuItem className="my-1 mx-3">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={clsx(
                        "flex items-center justify-between w-full py-2 px-3 rounded-md",
                        {
                          "bg-[#EEEEEE] text-black": item.children.some(
                            (child) => child.url === location.pathname
                          ),
                          "text-[#8C8C8C]": !item.children.some(
                            (child) => child.url === location.pathname
                          ),
                        }
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <DynamicIcon name={item.icon} className="h-5 w-5" />
                        <span className="text-[15px]">{item.nama}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent className="pl-6">
                  <SidebarMenuSub>
                    {item.children.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.nama}
                        className={clsx(
                          "my-1 mx-3 rounded-md",
                          location.pathname === subItem.url
                            ? "bg-[#EEEEEE] text-black"
                            : "text-[#8C8C8C]"
                        )}
                      >
                        <Link
                          to={subItem.url}
                          className="flex items-center gap-2 py-1 text-[14px] px-2"
                        >
                          {subItem.nama}
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem
                key={item.nama}
                className={clsx(
                  "my-1 mx-3 rounded-md",
                  location.pathname === item.url
                    ? "bg-primary text-white"
                    : "text-[#8C8C8C]"
                )}
              >
                <Link
                  to={item.url}
                  className="flex items-center gap-3 w-full py-2 px-3 text-[15px]"
                >
                  <DynamicIcon
                    name={item.icon}
                    className={clsx(
                      "h-5 w-5",
                      location.pathname === item.url
                        ? "text-white"
                        : "text-[#8C8C8C]"
                    )}
                  />
                  <span>{item.nama}</span>
                </Link>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebarBgGray;
