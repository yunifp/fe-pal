import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { STALE_TIME } from "@/constants/reactQuery";
import { masterService } from "@/services/masterService";
import { pksService } from "@/services/pksService";
import {
  statusMahasiswaEditSchema,
  type IMahasiswaPks,
  type StatusMahasiswaEditFormData,
} from "@/types/pks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustSelect } from "../ui/CustSelect";
import LoadingDialog from "../LoadingDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataMahasiswa?: IMahasiswaPks | null;
}

const UpdateStatusAktifMahasiswaDialog = ({
  open,
  onOpenChange,
  dataMahasiswa,
}: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<StatusMahasiswaEditFormData>({
    resolver: zodResolver(statusMahasiswaEditSchema),
    defaultValues: {
      is_active: "1",
      alasan_tidak_aktif: undefined,
      keterangan_tidak_aktif: "",
      file_pendukung: undefined,
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (open && dataMahasiswa) {
      form.reset({
        is_active: String(dataMahasiswa.status),
        alasan_tidak_aktif: dataMahasiswa.id_alasan_tidak_aktif
          ? (dataMahasiswa.id_alasan_tidak_aktif?.toString() ?? "") +
            "#" +
            (dataMahasiswa.alasan_tidak_aktif ?? "")
          : undefined,
        keterangan_tidak_aktif: dataMahasiswa.keterangan_tidak_aktif ?? "",
        file_pendukung: undefined,
      });
    }
  }, [open, dataMahasiswa, form]);

  const isActive = watch("is_active");

  // Mutation untuk update data
  const mutation = useMutation({
    mutationFn: (data: StatusMahasiswaEditFormData) =>
      pksService.updateStatusMahasiswa(dataMahasiswa?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);

        queryClient.invalidateQueries({
          queryKey: ["pks", "mahasiswa"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["pks", "statistik-mahasiswa"],
          exact: false,
        });

        form.reset();
        onOpenChange(false);
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

  const onSubmit = (data: StatusMahasiswaEditFormData) => {
    mutation.mutate(data);
  };

  // Mengambil alasan tidak aktif
  const { data: alasanTidakAktifData } = useQuery({
    queryKey: ["alasan-tidak-aktif"],
    queryFn: () => masterService.getAlasanTidakAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const alasanTidakAktifOptions = useMemo(() => {
    return (
      alasanTidakAktifData?.data?.map((data) => ({
        value: String(data.id + "#" + data.nama),
        label: data.nama,
      })) || []
    );
  }, [alasanTidakAktifData]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="font-inter" size="md">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle>Detail Mahasiswa</DialogTitle>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <Label>Nama</Label>
              <span>{dataMahasiswa?.nama}</span>
            </div>

            {/* RadioGroup is_active */}
            <div className="space-y-2">
              <Label>Aktif</Label>
              <RadioGroup
                className="flex flex-row gap-4"
                value={String(isActive)}
                onValueChange={(value) => setValue("is_active", value)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="1" id="aktif-1" />
                  <Label htmlFor="aktif-1">Ya</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="0" id="aktif-0" />
                  <Label htmlFor="aktif-0">Tidak</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Tanggal PKS jika tidak aktif */}
            {isActive === "0" && (
              <>
                <CustSelect
                  name="alasan_tidak_aktif"
                  control={control}
                  label="Alasan Tidak Aktif"
                  options={alasanTidakAktifOptions}
                  placeholder="Pilih alasan tidak aktif"
                  isRequired={true}
                  error={errors.alasan_tidak_aktif}
                />

                <CustTextArea
                  id="keterangan"
                  label="Keterangan"
                  isRequired={true}
                  error={!!errors.keterangan_tidak_aktif}
                  errorMessage={errors.keterangan_tidak_aktif?.message}
                  {...register("keterangan_tidak_aktif")}
                />

                <div className="space-y-1">
                  <div className="flex gap-4 justify-between items-center">
                    <Label className="flex items-center gap-1">
                      File Pendukung <span className="text-red-500">*</span>
                    </Label>

                    {dataMahasiswa?.file_pendukung && (
                      <a
                        onClick={() =>
                          window.open(dataMahasiswa.file_pendukung!!, "_blank")
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        File Sebelumnya
                      </a>
                    )}
                  </div>

                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("file_pendukung", file, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format file: PDF (maks. 5MB)
                  </p>
                  {errors.file_pendukung && (
                    <p className="text-xs text-destructive">
                      {errors.file_pendukung.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Update
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <LoadingDialog open={mutation.isPending} title="Menyimpan data" />
    </>
  );
};

export default UpdateStatusAktifMahasiswaDialog;
