import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { CustSelect } from "@/components/ui/CustSelect";
import { pksService } from "@/services/pksService";
import {
  biayaTransportasiCreateSchema,
  type BiayaTransportasiCreateFormData,
} from "@/types/pks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  idTrxMahasiswa: number;
}

const tahapOptions = [
  { value: "Awal", label: "Awal" },
  { value: "Akhir", label: "Akhir" },
];

const BiayaTransportasiCreate: FC<Props> = ({ idTrxMahasiswa }) => {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BiayaTransportasiCreateFormData>({
    resolver: zodResolver(biayaTransportasiCreateSchema),
    defaultValues: {
      tahap: undefined,
      jumlah: undefined,
    },
  });

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: BiayaTransportasiCreateFormData) =>
      pksService.createBiayaTransportasi(idTrxMahasiswa, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["data-mahasiswa", "biaya-transportasi", idTrxMahasiswa],
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

  const onSubmit = (data: BiayaTransportasiCreateFormData) => {
    mutation.mutate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustSelect
        name="tahap"
        control={control}
        label="Tahap"
        options={tahapOptions}
        placeholder="Pilih tahap"
        isRequired={true}
        error={errors.tahap}
      />

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
          Simpan Biaya Transportasi
        </Button>
      </div>
    </form>
  );
};

export default BiayaTransportasiCreate;
