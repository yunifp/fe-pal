import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustInput } from "@/components/CustInput";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { AUTH_SERVICE_BASE_URL } from "@/constants/api";

const resetPinSchema = z
  .object({
    new_pin: z.string().min(1, { message: "PIN Baru harus diisi" }),
    confirm_pin: z.string().min(1, { message: "Konfirmasi PIN harus diisi" }),
  })
  .refine((data) => data.new_pin === data.confirm_pin, {
    message: "PIN dan Konfirmasi PIN tidak cocok",
    path: ["confirm_pin"], // pesan error muncul di field confirm_pin
  });

type ResetPinFormData = z.infer<typeof resetPinSchema>;

const ResetPinPage = () => {
  const { id, token } = useParams<{ id: string; token: string }>();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPinFormData>({
    resolver: zodResolver(resetPinSchema),
  });

  const resetMutation = useMutation({
    // Menembak endpoint reset PIN langsung dengan axios
    mutationFn: (new_pin: string) =>
      axiosInstanceJson.post(`${AUTH_SERVICE_BASE_URL}/auth/reset-pin/${id}/${token}`, {
        new_pin,
      }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || "PIN berhasil direset");
      setIsSuccess(true);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal mereset PIN. Link mungkin sudah kedaluwarsa.");
    },
  });

  const onSubmit = (data: ResetPinFormData) => {
    resetMutation.mutate(data.new_pin);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg_beasiswa.png')`,
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0 w-full max-w-md">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <img src="/images/Ditjenbun.png" alt="Brand Logo" className="h-[60px] w-auto" />
            </div>
            
            <div className="flex flex-col items-center gap-1 mb-6 text-center">
              <span className="text-xl font-semibold">Reset PIN Anda</span>
              <span className="text-sm text-gray-500">
                {isSuccess 
                  ? "PIN Anda telah berhasil diperbarui." 
                  : "Silakan masukkan PIN baru untuk akun Anda."}
              </span>
            </div>

            {isSuccess ? (
              <div className="flex flex-col gap-4">
                <Button onClick={() => navigate("/login")} className="w-full bg-primary">
                  Kembali ke Halaman Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustInput
                  label="PIN Baru"
                  type="password"
                  id="new_pin"
                  placeholder="Masukkan PIN Baru"
                  error={!!errors.new_pin}
                  errorMessage={errors.new_pin?.message}
                  {...register("new_pin")}
                />

                <CustInput
                  label="Konfirmasi PIN Baru"
                  type="password"
                  id="confirm_pin"
                  placeholder="Ketik ulang PIN Baru"
                  error={!!errors.confirm_pin}
                  errorMessage={errors.confirm_pin?.message}
                  {...register("confirm_pin")}
                />

                <div className="pt-2">
                  <Button type="submit" disabled={resetMutation.isPending} className="w-full bg-primary">
                    {resetMutation.isPending ? "Menyimpan..." : "Simpan PIN Baru"}
                  </Button>
                </div>
                <div className="flex justify-center mt-4">
                  <Link to="/login" className="text-sm underline text-gray-500 hover:text-primary">
                    Batal dan kembali ke Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPinPage;