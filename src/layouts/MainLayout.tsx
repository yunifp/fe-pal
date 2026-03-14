import { Navbar } from "@/components/AppNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";

const MainLayout = () => {
  return (
    <SidebarProvider className="font-inter">
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <main className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
