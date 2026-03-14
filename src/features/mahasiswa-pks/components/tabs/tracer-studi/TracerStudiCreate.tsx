import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import { pksService } from "@/services/pksService";
import {
  tracerStudiCreateSchema,
  type TracerStudiCreateFormData,
} from "@/types/pks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  idTrxMahasiswa: number;
}

const TracerStudiCreate: FC<Props> = ({ idTrxMahasiswa }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TracerStudiCreateFormData>({
    resolver: zodResolver(tracerStudiCreateSchema),
    defaultValues: {
      jalur_karir: undefined,
      kontribusi_lulusan: undefined,
    },
  });

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: TracerStudiCreateFormData) =>
      pksService.createTracerStudi(idTrxMahasiswa, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["data-mahasiswa", "tracer-studi", idTrxMahasiswa],
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

  const onSubmit = (data: TracerStudiCreateFormData) => {
    mutation.mutate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustTextArea
        label="Jalur Karir"
        placeholder="Contoh: Karir di bidang IT, Manajemen Proyek, Riset, Pendidikan, dll."
        error={!!errors.jalur_karir}
        errorMessage={errors.jalur_karir?.message}
        {...register("jalur_karir")}
      />

      <CustTextArea
        label="Kontribusi Lulusan"
        placeholder="Contoh: Meningkatkan produktivitas perusahaan, membangun startup, berkontribusi pada riset nasional, dll."
        error={!!errors.kontribusi_lulusan}
        errorMessage={errors.kontribusi_lulusan?.message}
        {...register("kontribusi_lulusan")}
      />

      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Simpan Tracer Studi
        </Button>
      </div>
    </form>
  );
};

export default TracerStudiCreate;
