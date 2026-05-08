/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChevronDown, LogOut, User, Settings, ShieldCheck, Mail } from "lucide-react";
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
import { SecureImage } from "@/components/SecureImage"; // ✅ Tambahkan import SecureImage

const AvatarDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [isLogouting, setIslogouting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const avatarUrl = user?.avatar; 
  
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
      toast.success("Sesi berakhir, silakan login kembali.");
    } catch (error) {
      toast.error("Terjadi kendala saat keluar aplikasi.");
    } finally {
      setIslogouting(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-3 h-12 hover:bg-slate-100/80 rounded-2xl transition-all duration-300 group select-none"
          >
            <div className="relative flex-shrink-0">
              {avatarUrl && !imageError ? (
                <SecureImage
                  src={avatarUrl}
                  className="h-9 w-9 rounded-2xl object-cover ring-2 ring-white shadow-md transition-transform group-hover:scale-105"
                  alt="profile"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md transition-transform group-hover:scale-105 font-bold">
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
            </div>

            <div className="hidden lg:flex flex-col items-start text-left">
              <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                {user?.nama || "User"}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-tight">
                {user?.email || "Administrator"}
              </span>
            </div>

            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-y-0.5 transition-all" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-72 mt-2 p-3 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300" 
          align="end" 
          sideOffset={10}
        >
          <DropdownMenuLabel className="p-0 mb-3">
            <div className="flex flex-col items-center text-center p-5 bg-gradient-to-b from-slate-50 to-white rounded-[1.25rem] border border-slate-100 shadow-sm">
              <div className="relative mb-3">
                <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xl shadow-inner border border-white">
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm border border-slate-50">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-base font-black text-slate-800 leading-tight mb-1">{user?.nama}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                <Mail className="h-3 w-3" />
                <span>{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <div className="space-y-1">
            <DropdownMenuItem 
              className="cursor-pointer rounded-xl py-3 px-4 focus:bg-emerald-50 focus:text-emerald-700 font-bold text-slate-600 transition-all gap-3"
              onClick={() => navigate("/profile")}
            >
              <User className="h-4.5 w-4.5 opacity-70" /> 
              Profil Personal
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer rounded-xl py-3 px-4 focus:bg-emerald-50 focus:text-emerald-700 font-bold text-slate-600 transition-all gap-3"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4.5 w-4.5 opacity-70" /> 
              Konfigurasi Akun
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="my-2 bg-slate-100" />

          <DropdownMenuItem 
            className="cursor-pointer rounded-xl py-3 px-4 text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-black transition-all gap-3 group"
            onClick={handleLogout}
          >
            <LogOut className="h-4.5 w-4.5 opacity-70 group-hover:rotate-12 transition-transform" /> 
            Keluar Aplikasi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LoadingDialog open={isLogouting} title="Mengamankan sesi anda..." />
    </>
  );
};

export default AvatarDropdown;