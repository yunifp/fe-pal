import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileSchema, type ProfileFormData } from "../types/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { logout } = useAuthStore();

  const navigate = useNavigate();

  // Validasi form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: "",
      user_id: "",
      current_pin: undefined,
      pin: undefined,
      confirm_pin: undefined,
      avatar: undefined,
    },
  });

  // Mengambil data dari API
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.getProfile(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        nama: data.data.nama,
        user_id: data.data.user_id,
      });
    }
  }, [data?.data, reset]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => authService.updateProfile(data),

    onSuccess: (res) => {
      if (res.success) {
        toast.success("Profile berhasil diupdate. Silakan login kembali.");

        // beri delay agar toast sempat muncul
        setTimeout(() => {
          logout();
          navigate("/login", { replace: true });
        }, 1000);
      } else {
        toast.error(res.message);
      }
    },

    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  return (
    <>
      <CustBreadcrumb items={[{ name: "Profil" }]} />
      <p className="text-xl font-semibold mt-4">Profil Saya</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                {data?.data?.avatar && (
                  <img
                    src={data.data.avatar}
                    alt="Avatar"
                    className="w-[150px] h-[150px] rounded-full object-cover"
                  />
                )}

                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("avatar", file);
                    }
                  }}
                  className="w-full max-w-xs"
                />
              </div>
              <CustInput
                label="User ID"
                id="user_id"
                placeholder="Masukkan user_id"
                {...register("user_id")}
                error={!!errors.user_id}
                errorMessage={errors.user_id?.message}
                disabled
              />
              <CustInput
                label="Nama Lengkap"
                id="nama"
                placeholder="Masukkan nama lengkap"
                {...register("nama")}
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
              />

              <Separator />

              <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">
                  Perhatian
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Password digunakan untuk keamanan transaksi. Jangan bagikan
                  Password Anda kepada siapa pun.
                </AlertDescription>
              </Alert>

              <CustInput
                label="Password Sekarang"
                id="current_pin"
                type="password"
                placeholder="Masukkan Password saat ini"
                {...register("current_pin")}
                error={!!errors.current_pin}
                errorMessage={errors.current_pin?.message}
              />

              <CustInput
                label="Password Baru"
                id="pin"
                type="password"
                placeholder="Masukkan Password baru"
                {...register("pin")}
                error={!!errors.pin}
                errorMessage={errors.pin?.message}
              />

              <CustInput
                label="Konfirmasi Password Baru"
                id="confirm_pin"
                type="password"
                placeholder="Ulangi Password baru"
                {...register("confirm_pin")}
                error={!!errors.confirm_pin}
                errorMessage={errors.confirm_pin?.message}
              />

              <div className="mt-8 flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || isLoading || mutation.isPending || isError
                  }
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
