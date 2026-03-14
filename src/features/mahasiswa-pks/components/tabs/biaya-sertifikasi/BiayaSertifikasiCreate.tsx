import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { pksService } from "@/services/pksService";
import {
  biayaSertifikasiCreateSchema,
  type BiayaSertifikasiCreateFormData,
} from "@/types/pks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  idTrxMahasiswa: number;
}

const BiayaSertifikasiCreate: FC<Props> = ({ idTrxMahasiswa }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BiayaSertifikasiCreateFormData>({
    resolver: zodResolver(biayaSertifikasiCreateSchema),
    defaultValues: {
      jumlah: undefined,
    },
  });

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: BiayaSertifikasiCreateFormData) =>
      pksService.createBiayaSertifikasi(idTrxMahasiswa, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["data-mahasiswa", "biaya-sertifikasi", idTrxMahasiswa],
        });
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

  const onSubmit = (data: BiayaSertifikasiCreateFormData) => {
    mutation.mutate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustInput
        label="Jumlah"
        type="number"
        placeholder="Contoh: 100.000.000"
        error={!!errors.jumlah}
        errorMessage={errors.jumlah?.message}
        {...register("jumlah", { valueAsNumber: true })}
      />

      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Simpan Biaya Sertifikasi
        </Button>
      </div>
    </form>
  );
};

export default BiayaSertifikasiCreate;
