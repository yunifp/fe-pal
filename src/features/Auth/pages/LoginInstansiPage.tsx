/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Navbar from "@/features/landing-alt/components/landing-page/Navbar";
import Footer from "@/features/landing-alt/components/Footer";
import { CustPassword } from "@/components/CustPassword";
import { useEffect, useState } from "react";
import LoadingDialog from "@/components/LoadingDialog";
import { Input } from "@/components/ui/input";
import { RefreshCcw } from "lucide-react";

const loginSchema = z.object({
  user_id: z.string().min(1, { message: "User ID harus diisi" }),
  pin: z.string().min(1, { message: "PIN harus diisi" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginInstansiPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMenus = useMenuStore((state) => state.setMenus);

  const [isLoading, setIsLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState<string>("");
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fetchCaptcha = async () => {
    try {
      setCaptchaError("");
      setCaptchaAnswer("");
      const res = await authService.getCaptcha();

      if (res.success && res.data) {
        setCaptchaId(res.data.captchaId);
        setCaptchaQuestion(res.data.question);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (data: LoginFormData) => {
    if (!captchaAnswer) {
      setCaptchaError("Jawaban captcha wajib diisi");
      return;
    }

    setIsLoading(true);
    setCaptchaError("");

    try {
      const payload: LoginRequest & { captchaId: string; answer: number } = {
        user_id: data.user_id,
        pin: data.pin,
        jenis_akun: "instansi",
        captchaId: captchaId,
        answer: parseInt(captchaAnswer),
      };

      const response = await authService.login(payload);

      if (response.success && response.data) {
        toast.success(response.message);

        const authUser: AuthUser = {
          id: response.data.user.id ?? "",
          nama: response.data.user.nama_lengkap ?? "",
          avatar: response.data.user.avatar ?? "",
          email: response.data.user.email ?? "",
          no_hp: response.data.user.no_hp ?? "",
          user_id: response.data.user.user_id ?? "",
          id_lembaga_pendidikan: response.data.user.id_lembaga_pendidikan ?? null,
          lembaga_pendidikan: response.data.user.lembaga_pendidikan ?? null,
          id_role: response.data.user.role.map((role: any) => role.id),
          kode_prov: response.data.user.kode_prov ?? "",
          kode_kab: response.data.user.kode_kab ?? "",
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden">
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
          style={{
            background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg-2.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}>
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0">
            <Card>
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
                  <span className="text-sm text-gray-500 text-center">
                    Masukkan username dan kata sandi anda untuk mengakses
                    aplikasi
                  </span>
                </div>
                <form onSubmit={handleSubmit(handleLogin)}>
                  <div className="grid w-full items-center gap-6">
                    <CustInput
                      label="Username"
                      type="text"
                      id="user_id"
                      placeholder="Masukkan Username"
                      error={!!errors.user_id}
                      errorMessage={errors.user_id?.message}
                      {...register("user_id")}
                    />

                    <CustPassword
                      label="Password"
                      id="pin"
                      placeholder="Masukkan Password"
                      autoComplete="pin"
                      error={!!errors.pin}
                      errorMessage={errors.pin?.message}
                      {...register("pin")}
                    />

                    <div className="flex flex-col gap-1.5 -mt-2">
                      <label className="text-sm font-medium text-gray-700">Pertanyaan Keamanan</label>
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center bg-green-50 border border-green-200 text-green-800 font-bold tracking-wider rounded-md h-10 px-4 min-w-[100px] select-none">
                          {captchaQuestion || "..."}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <Input
                            type="number"
                            placeholder="Jawaban"
                            value={captchaAnswer}
                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                            className={`h-10 ${captchaError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {captchaError && (
                            <span className="text-xs text-red-500 font-medium">{captchaError}</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-10 w-10 text-gray-500 hover:text-gray-900 transition-colors"
                          onClick={fetchCaptcha}>
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-primary" disabled={isLoading || !captchaId}>
                      Masuk
                    </Button>
                    <Link
                      to="/"
                      className="mx-auto text-sm underline text-gray-500 -mt-2">
                      Kembali
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
      <LoadingDialog open={isLoading} title="Memproses login..." />
    </>
  );
};

export default LoginInstansiPage;