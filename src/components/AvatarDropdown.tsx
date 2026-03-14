import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/Auth/services/authService";
import { useState } from "react";
import { toast } from "sonner";
import LoadingDialog from "./LoadingDialog";

const AvatarDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [isLogouting, setIslogouting] = useState(false);

  const handleLogout = async () => {
    setIslogouting(true);
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      navigate("/logout");
      toast.success("Berhasil logout");
    } catch (error) {
      toast.error("Terjadi kesalahan saat logout");
    } finally {
      setIslogouting(false);
    }
  };

  const handleRedirect = () => {
    navigate("/profile");
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 max-w-[220px]"
            >
              <img
                src={user?.avatar}
                className="h-7 w-7 rounded-full object-cover"
                alt="avatar"
              />

              <span className="truncate text-xs font-medium max-w-[100px]">
                {user?.nama}
              </span>

              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="font-inter" align="end" sideOffset={5}>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-bold leading-none">{user?.nama}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleRedirect}>
            <User className="h-4 w-4" /> Profil Saya
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LoadingDialog open={isLogouting} title="Memproses logout" />
    </>
  );
};

export default AvatarDropdown;
