/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { npsnSchema, type NpsnFormData } from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NpsnCreatePage = () => {
  useRedirectIfHasNotAccess("C");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NpsnFormData>({
    resolver: zodResolver(npsnSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: NpsnFormData) => masterService.createNpsn(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil menambahkan data NPSN");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      navigate("/master-npsn");
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (data: NpsnFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "NPSN", url: "/master/npsn" }, { name: "Tambah NPSN" }]}
      />
      <p className="text-xl font-semibold mt-4">Tambah NPSN</p>

      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustInput
                label="ID Jenjang"
                placeholder="Masukkan ID jenjang"
                type="number"
                {...register("id_jenjang", { valueAsNumber: true })}
                error={!!errors.id_jenjang}
                errorMessage={errors.id_jenjang?.message}
              />

              <CustInput
                label="Nama Sekolah"
                placeholder="Masukkan nama sekolah"
                {...register("sekolah")}
                error={!!errors.sekolah}
                errorMessage={errors.sekolah?.message}
              />

              <CustInput
                label="NPSN"
                placeholder="Masukkan nomor NPSN"
                {...register("npsn")}
                error={!!errors.npsn}
                errorMessage={errors.npsn?.message}
              />

              <CustInput
                label="Jenis Sekolah"
                placeholder="Contoh: SMA, SMK, MA"
                {...register("jenis_sekolah")}
                error={!!errors.jenis_sekolah}
                errorMessage={errors.jenis_sekolah?.message}
              />

              <div className="mt-8 flex items-center justify-between">
                <Link to="/master-npsn">
                  <Button type="button" variant="secondary">
                    Kembali
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}>
                  {isSubmitting || mutation.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NpsnCreatePage;
