/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import Navbar from "@/features/landing-alt/components/pendaftaran-beasiswa/Navbar";
import Footer from "@/features/landing-alt/components/Footer";
import { ForgotPinDialog } from "../components/ForgotPinDialog"; 
import { RefreshCcw } from "lucide-react";

const loginSchema = z.object({
  user_id: z.string().min(1, { message: "User ID harus diisi" }),
  pin: z.string().min(1, { message: "PIN harus diisi" }),
  captchaAnswer: z.string().min(1, { message: "Jawaban keamanan wajib diisi" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPenerimaBeasiswaPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMenus = useMenuStore((state) => state.setMenus);

  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);
  const [captchaData, setCaptchaData] = useState<{ id: string; question: string } | null>(null);

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fetchCaptcha = async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.success && res.data) {
        setCaptchaData({ id: res.data.captchaId, question: res.data.question });
        setValue("captchaAnswer", ""); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (data: LoginFormData) => {
    try {
      const payload: LoginRequest & { captchaId: string; answer: number } = {
        user_id: data.user_id,
        pin: data.pin,
        jenis_akun: "penerima-beasiswa",
        captchaId: captchaData?.id || "",
        answer: parseInt(data.captchaAnswer),
      };

      const response = await authService.login(payload);

      if (response.success && response.data) {
        toast.success(response.message);

        const authUser: AuthUser = {
          id: response.data.user.id ?? "",
          nama: response.data.user.nama_lengkap ?? "",
          avatar: response.data.user.avatar ?? "",
          user_id: response.data.user.user_id ?? "",
          id_lembaga_pendidikan: response.data.user.id_lembaga_pendidikan ?? null,
          lembaga_pendidikan: response.data.user.lembaga_pendidikan ?? null,
          id_role: response.data.user.role.map((role: any) => role.id),
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
        toast.error(response.message || "Gagal melakukan login");
        await fetchCaptcha();
      }
    } catch (error: any) {
      await fetchCaptcha();
      const errorMessage = error?.response?.data?.message || error?.message || "Terjadi kesalahan sistem";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Navbar
        hasBeasiswaAktif={beasiswaAktif !== null}
        isBeasiswaLoading={isBeasiswaAktifLoading}
      />
      <div className="relative overflow-hidden">
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
          style={{
            background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg_beasiswa.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}>
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0">
            <Card className="w-full max-w-md">
              <CardContent>
                <div className="flex justify-center mb-4 pt-6">
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
                  <span className="text-sm text-gray-500 text-center max-w-[300px]">
                    Masukkan username dan PIN Anda untuk mengakses aplikasi
                  </span>
                </div>
                <form onSubmit={handleSubmit(handleLogin)}>
                  <div className="grid w-full items-center gap-5">
                    <CustInput
                      label="User ID"
                      type="text"
                      id="user_id"
                      placeholder="Masukkan User ID"
                      error={!!errors.user_id}
                      errorMessage={errors.user_id?.message}
                      {...register("user_id")}
                    />

                    <CustInput
                      label="PIN"
                      type="password"
                      id="pin"
                      placeholder="Masukkan PIN"
                      error={!!errors.pin}
                      errorMessage={errors.pin?.message}
                      {...register("pin")}
                    />

                    <div className="flex flex-col gap-1.5 -mt-1">
                      <label className="text-sm font-medium text-gray-700">Pertanyaan Keamanan</label>
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center bg-green-50 border border-green-200 text-green-800 font-bold tracking-wider rounded-md h-10 px-4 min-w-[100px] select-none">
                          {captchaData ? captchaData.question : "..."}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <Input
                            type="number"
                            id="captchaAnswer"
                            placeholder="Jawaban"
                            className={`h-10 ${errors.captchaAnswer ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            {...register("captchaAnswer")}
                          />
                          {errors.captchaAnswer && (
                            <span className="text-xs text-red-500 font-medium">{errors.captchaAnswer.message}</span>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={fetchCaptcha}
                          className="shrink-0 h-10 w-10 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end items-center -mt-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotPinOpen(true)}
                        className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Lupa PIN?
                      </button>
                    </div>
                    
                    <Button type="submit" className="mt-2 w-full bg-primary" disabled={isSubmitting || !captchaData}>
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

      <ForgotPinDialog
        isOpen={isForgotPinOpen}
        onClose={() => setIsForgotPinOpen(false)}
      />
    </>
  );
};

export default LoginPenerimaBeasiswaPage;