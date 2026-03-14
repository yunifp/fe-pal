import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { CustSelect } from "@/components/ui/CustSelect";
import { biayaHidupService } from "@/services/biayaHidupService";
import {
  biayaHidupPksCreateSchema,
  type BiayaHidupPksCreateFormData,
} from "@/types/biayaHidup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  idTrxPks: number;
}

const bulanOptions = [
  { value: "Januari", label: "Januari" },
  { value: "Februari", label: "Februari" },
  { value: "Maret", label: "Maret" },
  { value: "April", label: "April" },
  { value: "Mei", label: "Mei" },
  { value: "Juni", label: "Juni" },
  { value: "Juli", label: "Juli" },
  { value: "Agustus", label: "Agustus" },
  { value: "September", label: "September" },
  { value: "Oktober", label: "Oktober" },
  { value: "November", label: "November" },
  { value: "Desember", label: "Desember" },
];

const PengajuanBiayaForm: FC<Props> = ({ idTrxPks }) => {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BiayaHidupPksCreateFormData>({
    resolver: zodResolver(biayaHidupPksCreateSchema),
    defaultValues: {
      tahun: undefined,
      bulan: undefined,
      jumlah: undefined,
    },
  });

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: BiayaHidupPksCreateFormData) =>
      biayaHidupService.createBiayaHidupPks(idTrxPks, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pks-pengajuan-biaya", "biaya-hidup", idTrxPks],
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

  const onSubmit = (data: BiayaHidupPksCreateFormData) => {
    mutation.mutate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustInput
        label="Tahun"
        type="number"
        placeholder="Contoh: 2024"
        isRequired={true}
        error={!!errors.tahun}
        errorMessage={errors.tahun?.message}
        {...register("tahun", { valueAsNumber: true })}
      />

      <CustSelect
        name="bulan"
        control={control}
        label="Bulan"
        options={bulanOptions}
        placeholder="Pilih bulan"
        isRequired={true}
        error={errors.bulan}
      />

      <CustInput
        label="Jumlah"
        type="number"
        placeholder="Contoh: 100.000.000"
        isRequired={true}
        error={!!errors.jumlah}
        errorMessage={errors.jumlah?.message}
        {...register("jumlah", { valueAsNumber: true })}
      />

      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Ajukan
        </Button>
      </div>
    </form>
  );
};

export default PengajuanBiayaForm;
