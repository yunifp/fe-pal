import { SidebarTrigger } from "./ui/sidebar";
import AvatarDropdown from "./AvatarDropdown";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <SidebarTrigger />
      <div className="flex gap-2">
        <AvatarDropdown />
      </div>
    </nav>
  );
}
