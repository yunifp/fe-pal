import type { IMenu } from "@/types/menu";
import type { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "./ui/sidebar";
import clsx from "clsx";
import DynamicIcon from "./DynamicIcon";
import { ChevronDown } from "lucide-react";

interface RenderSidebarItemsProps {
  items: IMenu[];
  level?: number;
}

const RenderSidebarItems: FC<RenderSidebarItemsProps> = ({
  items,
  level = 0,
}) => {
  const location = useLocation();
  const paddingLeft = 3 + level * 2;

  return items.map((item: IMenu) => {
    const isActive = location.pathname === item.url;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      const isAnyChildActive = item.children?.some(
        (child) =>
          child.url === location.pathname ||
          (child.children ?? []).some(
            (grandChild) => grandChild.url === location.pathname,
          ),
      );

      return (
        <Collapsible
          key={item.id}
          className="group"
          defaultOpen={isAnyChildActive}
        >
          <SidebarMenuItem className="my-1 mx-3">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={clsx(
                  "flex items-center justify-between w-full py-2 px-3 rounded-md",
                  isAnyChildActive ? "bg-white text-black" : "text-white",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon && (
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 shrink-0"
                    />
                  )}
                  <span className="text-[15px] truncate">{item.nama}</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent className={`pl-${paddingLeft}`}>
            <SidebarMenuSub>
              <RenderSidebarItems
                items={item.children ?? []}
                level={level + 1}
              />
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem
        key={item.id}
        className={clsx(
          "my-1 mx-3 rounded-md",
          isActive ? "bg-white text-black" : "text-white",
        )}
      >
        <Link
          to={item.url}
          className={clsx(
            "flex items-start gap-3 w-full py-2 px-3 text-[15px]",
            `pl-${paddingLeft}`,
          )}
        >
          {item.icon && (
            <DynamicIcon
              name={item.icon}
              className={clsx(
                "h-5 w-5 min-w-[20px] shrink-0 mt-0.5",
                isActive ? "text-black" : "text-white",
              )}
            />
          )}

          <span>{item.nama}</span>
        </Link>
      </SidebarMenuItem>
    );
  });
};

export default RenderSidebarItems;
