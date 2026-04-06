/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import LoadingDialog from "./LoadingDialog";

// 👇 UNCOMMENT DAN SESUAIKAN JIKA URL GAMBAR DARI BACKEND BELUM FULL URL (CUMA NAMA FILE)
// const BACKEND_PUBLIC_URL = "http://localhost:3003/uploads"; 

const AvatarDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [isLogouting, setIslogouting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 👇 Pastikan properti gambar sudah benar (ubah ke user?.foto jika di database namanya foto)
  const avatarUrl = user?.avatar; 
  
  // 👇 Jika butuh ditambahkan base URL, gunakan kode ini:
  // const avatarUrl = user?.avatar ? `${BACKEND_PUBLIC_URL}/${user.avatar}` : null;

  // Reset error state setiap kali url avatar berubah (misal ganti akun)
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

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
          <Button
            variant="outline"
            className="flex items-center gap-2 max-w-[220px]"
          >
            {/* Logika: Tampilkan gambar JIKA URL ada DAN belum terjadi error saat meload */}
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                className="h-7 w-7 rounded-full object-cover"
                alt="avatar"
                onError={() => {
                  console.log("Gambar gagal dimuat, menampilkan icon fallback.");
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <User className="h-4 w-4" />
              </div>
            )}

            <span className="truncate text-xs font-medium max-w-[100px]">
              {user?.nama || "User"}
            </span>

            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
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
            <User className="h-4 w-4 mr-2" /> Profil Saya
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LoadingDialog open={isLogouting} title="Memproses logout" />
    </>
  );
};

export default AvatarDropdown;