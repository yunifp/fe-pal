import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CustInput } from "@/components/CustInput";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { useState } from "react";
import { type RegisterResponse, type RegisterRequest } from "../types/auth";
import { toast } from "sonner";
import { authService } from "../services/authService";
import UserCredentialsDialog from "../components/UserCredentialsDialog";
import { beasiswaService } from "@/services/beasiswaService";
import { TidakAdaBeasiswaAktif } from "../components/TidakAdaBeasiswaAktif";
import Navbar from "@/features/landing-alt/components/pendaftaran-beasiswa/Navbar";
import Footer from "@/features/landing-alt/components/Footer";
import { toUpperCase } from "@/utils/stringFormatter";

const registerSchema = z.object({
  nama: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama terlalu panjang")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),

  email: z
    .string()
    .email("Format email tidak valid")
    .max(100, "Email terlalu panjang"),

  noHp: z
    .string()
    .min(8, "No HP minimal 8 digit")
    .max(15, "No HP maksimal 15 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPenerimaBeasiswaPage = () => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [registerResponse, setRegisterResponse] =
    useState<RegisterResponse | null>(null);

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
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload: RegisterRequest = {
        nama_lengkap: data.nama,
        email: data.email,
        no_hp: data.noHp,
        jenis_akun: "beasiswa",
      };

      const response = await authService.register(payload);
      if (response.success) {
        setRegisterResponse(response.data);
        setShowDialog(true);
        reset();
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
            background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg-2.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}>
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0">
            {beasiswaAktif ? (
              <Card className="shadow-none mt-[100px] mb-[50px]">
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <img
                      src="/images/Ditjenbun.png"
                      alt="Brand Logo"
                      className="h-[60px] w-auto"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 mb-6">
                    <span className="text-xl font-semibold text-center">
                      Buat Akun Calon Penerima Beasiswa
                    </span>
                    <span className="text-sm text-gray-500 text-center">
                      Dengan mendaftar, Anda akan mendapatkan User ID dan PIN
                      pribadi yang akan digunakan untuk login
                    </span>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid w-full items-center gap-6">
                      {/* Nama */}
                      <CustInput
                        label="Nama Lengkap"
                        type="text"
                        id="nama"
                        placeholder="Masukkan nama lengkap"
                        error={!!errors.nama}
                        errorMessage={errors.nama?.message}
                        {...register("nama", {
                          onChange: (e) => {
                            const value = e.target.value;
                            setValue("nama", toUpperCase(value));
                          },
                        })}
                      />

                      {/* Email */}
                      <CustInput
                        label="Email"
                        type="email"
                        id="email"
                        placeholder="Masukkan email"
                        error={!!errors.email}
                        errorMessage={errors.email?.message}
                        {...register("email")}
                      />

                      {/* No HP */}
                      <CustInput
                        label="No HP"
                        type="text"
                        id="noHp"
                        placeholder="Masukkan no HP"
                        error={!!errors.noHp}
                        errorMessage={errors.noHp?.message}
                        {...register("noHp")}
                      />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="mt-2 w-full bg-primary"
                        disabled={isSubmitting}>
                        Daftar
                      </Button>
                    </div>
                  </form>
                  <div className="flex justify-center items-center gap-1 mt-6">
                    <span className="text-sm text-muted-foreground">
                      Sudah punya akun?
                    </span>
                    <Link to="/login" className="text-sm text-primary">
                      Masuk disini
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TidakAdaBeasiswaAktif />
            )}
          </div>
        </div>
      </div>
      <Footer />
      {showDialog && (
        <UserCredentialsDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          userId={registerResponse?.user_id!!}
          pin={registerResponse?.pin!!}
        />
      )}
    </>
  );
};

export default RegisterPenerimaBeasiswaPage;
