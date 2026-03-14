import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/features/Auth/services/authService";
import { toast } from "sonner";
import { useAuthStore, type AuthUser } from "@/stores/authStore";
import { useMenuStore } from "@/stores/menuStore";
import type { LoginRequest } from "../types/auth";
import { CustInput } from "@/components/CustInput";
import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import Navbar from "@/features/landing-alt/components/pendaftaran-beasiswa/Navbar";
import Footer from "@/features/landing-alt/components/Footer";

const loginSchema = z.object({
  user_id: z.string().min(1, { message: "User ID harus diisi" }),
  pin: z.string().min(1, { message: "PIN harus diisi" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPenerimaBeasiswaPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMenus = useMenuStore((state) => state.setMenus);

  // Setup untuk mendapatkan beasiswa aktif
  const { data: responseBeasiswaAktif, isLoading: isBeasiswaAktifLoading } =
    useQuery({
      queryKey: ["beasiswa-aktif"],
      queryFn: () => beasiswaService.getBeasiswaAktif(),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const payload: LoginRequest = {
        user_id: data.user_id,
        pin: data.pin,
        jenis_akun: "penerima-beasiswa",
      };

      const response = await authService.login(payload);

      if (response.success && response.data) {
        toast.success(response.message);

        const authUser: AuthUser = {
          id: response.data.user.id ?? "",
          nama: response.data.user.nama_lengkap ?? "",
          avatar: response.data.user.avatar ?? "",
          user_id: response.data.user.user_id ?? "",
          id_lembaga_pendidikan:
            response.data.user.id_lembaga_pendidikan ?? null,
          lembaga_pendidikan: response.data.user.lembaga_pendidikan ?? null,
          id_role: response.data.user.role.map((role) => role.id),
          email: response.data.user.email ?? "",
          no_hp: response.data.user.no_hp ?? "",
        };

        setAuth(
          authUser,
          response.data.accessToken,
          response.data.refreshToken,
        );

        setMenus(response.data.menus);

        navigate(response.data.redirectPage);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <>
      <Navbar
        hasBeasiswaAktif={beasiswaAktif !== null}
        isBeasiswaLoading={isBeasiswaAktifLoading}
      />
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
          style={{
            background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg_beasiswa.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}>
          {/* Main Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0">
            <Card>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <img
                    src="/images/Ditjenbun.png"
                    alt="Brand Logo"
                    className="h-[60px] w-auto"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 mb-6">
                  <span className="text-xl font-semibold">
                    Selamat Datang !
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Masukkan username dan kata sandi anda untuk mengakses
                    aplikasi
                  </span>
                </div>
                <form onSubmit={handleSubmit(handleLogin)}>
                  <div className="grid w-full items-center gap-6">
                    {/* User ID */}
                    <CustInput
                      label="User ID"
                      type="text"
                      id="usert_id"
                      placeholder="Masukkan User ID"
                      error={!!errors.user_id}
                      errorMessage={errors.user_id?.message}
                      {...register("user_id")}
                    />

                    {/* PIN*/}
                    <CustInput
                      label="PIN"
                      type="text"
                      id="pin"
                      placeholder="Masukkan PIN"
                      error={!!errors.pin}
                      errorMessage={errors.pin?.message}
                      {...register("pin")}
                    />
                    <div className="flex justify-between items-center -mt-2">
                      <div></div>
                      <span className="text-sm text-primary">
                        Lupa Password ?
                      </span>
                    </div>
                    <Button type="submit" className="mt-2 w-full bg-primary">
                      Masuk
                    </Button>
                    <Link
                      to="/"
                      className="mx-auto text-sm underline text-gray-500 -mt-2">
                      Kembali
                    </Link>
                  </div>
                </form>
                <div className="flex justify-center items-center gap-1 mt-6">
                  <span className="text-sm text-muted-foreground">
                    Belum punya akun?
                  </span>
                  <Link
                    to="/daftar-penerima-beasiswa"
                    className="text-sm text-primary">
                    Daftar disini
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LoginPenerimaBeasiswaPage;
