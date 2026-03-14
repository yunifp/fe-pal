import LoadingDialog from "@/components/LoadingDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { biayaTransportasiService } from "@/services/biayaTransportasiService";
import {
  ajukanKeVerifikatorSchema,
  type AjukanKeVerifikatorFormData,
  type ITrxBiayaTransportasiPksWithPks,
} from "@/types/biayaTransportasi";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  dataBiayaTransportasi?: ITrxBiayaTransportasiPksWithPks | null;
}

const RevisiDialog = ({ open, setOpen, dataBiayaTransportasi }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<AjukanKeVerifikatorFormData>({
    resolver: zodResolver(ajukanKeVerifikatorSchema),
    defaultValues: {
      status_verifikasi: "hasil_perbaikan",
      daftar_nominatif: undefined,
      salinan_bukti_pengeluaran: undefined,
      sptjm: undefined,
      bukti_kwitansi: undefined,
    },
  });

  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (!dataBiayaTransportasi) return;

    setValue("id_trx_pks", dataBiayaTransportasi.id_trx_pks!!);
    setValue("tahap", dataBiayaTransportasi.tahap!!);
    setValue("tahun", dataBiayaTransportasi.tahun!!);

    setValue(
      "total_mahasiswa",
      dataBiayaTransportasi.total_mahasiswa_aktif!! +
        dataBiayaTransportasi.total_mahasiswa_tidak_aktif!!,
    );

    setValue(
      "total_mahasiswa_aktif",
      dataBiayaTransportasi.total_mahasiswa_aktif!!,
    );

    setValue(
      "total_mahasiswa_tidak_aktif",
      dataBiayaTransportasi.total_mahasiswa_tidak_aktif!!,
    );

    setValue("jumlah_nominal", dataBiayaTransportasi.jumlah!!);
  }, [dataBiayaTransportasi, setValue]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: AjukanKeVerifikatorFormData) =>
      biayaTransportasiService.ajukanKeVerifikator(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-transportasi"],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "log-pengajuan",
            "biaya-transportasi",
            dataBiayaTransportasi?.id,
          ],
        });
        setOpen(false);
        toast.success(res.message);
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

  const onSubmit = (data: AjukanKeVerifikatorFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="font-inter">
          <DialogHeader>
            <DialogTitle>Revisi Pengajuan dari Verifikator</DialogTitle>
            <DialogDescription>
              Pengajuan biaya transportasi memerlukan perbaikan sesuai catatan
              verifikator. Silakan lakukan revisi dan ajukan kembali.
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Catatan Verifikator</AlertTitle>
            <AlertDescription className="mt-1">
              {dataBiayaTransportasi?.catatan_verifikator ||
                "Tidak ada catatan dari verifikator."}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* hidden fields */}
            <input type="hidden" {...register("id_trx_pks")} />
            <input type="hidden" {...register("tahap")} />
            <input type="hidden" {...register("tahun")} />
            <input type="hidden" {...register("total_mahasiswa")} />
            <input type="hidden" {...register("total_mahasiswa_aktif")} />
            <input type="hidden" {...register("total_mahasiswa_tidak_aktif")} />
            <input
              type="hidden"
              {...register("jumlah_nominal", { valueAsNumber: true })}
            />

            {/* INFO PKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nomor PKS</span>
                <p className="font-medium">
                  {dataBiayaTransportasi?.no_pks || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Tanggal PKS</span>
                <p className="font-medium">
                  {formatTanggalIndo(dataBiayaTransportasi?.tanggal_pks)}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Lembaga Pendidikan
                </span>
                <p className="font-medium">
                  {dataBiayaTransportasi?.lembaga_pendidikan || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Jenjang</span>
                <p className="font-medium">
                  {dataBiayaTransportasi?.jenjang || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Periode</span>
                <p className="font-medium">
                  {dataBiayaTransportasi?.tahap} {dataBiayaTransportasi?.tahun}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Total Biaya Transportasi
                </span>
                <p className="font-medium">
                  {formatRupiah(dataBiayaTransportasi?.jumlah!!)}
                </p>
              </div>
            </div>

            <Separator />

            {/* FILE UPLOAD */}
            {/* FILE UPLOAD */}
            <div>
              <h3 className="font-semibold mb-4 text-base">Upload Dokumen</h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Daftar Nominatif */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">
                      Daftar Nominatif{" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    {dataBiayaTransportasi?.file_daftar_nominatif && (
                      <a
                        onClick={() =>
                          window.open(
                            dataBiayaTransportasi?.file_daftar_nominatif!!,
                            "_blank",
                          )
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex items-center w-fit"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Lihat File Sebelumnya
                      </a>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="cursor-pointer"
                    onChange={(e) =>
                      setValue("daftar_nominatif", e.target.files?.[0]!!, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.daftar_nominatif && (
                    <p className="text-xs text-destructive">
                      {errors.daftar_nominatif.message as string}
                    </p>
                  )}
                </div>

                {/* Salinan Bukti Pengeluaran */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">
                      Salinan Bukti Pengeluaran{" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    {dataBiayaTransportasi?.file_salinan_bukti_pengeluaran && (
                      <a
                        onClick={() =>
                          window.open(
                            dataBiayaTransportasi?.file_salinan_bukti_pengeluaran!!,
                            "_blank",
                          )
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex items-center w-fit"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Lihat File Sebelumnya
                      </a>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="cursor-pointer"
                    onChange={(e) =>
                      setValue(
                        "salinan_bukti_pengeluaran",
                        e.target.files?.[0]!!,
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                  {errors.salinan_bukti_pengeluaran && (
                    <p className="text-xs text-destructive">
                      {errors.salinan_bukti_pengeluaran.message as string}
                    </p>
                  )}
                </div>

                {/* Surat SPTJM */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">
                      Surat Pernyataan Tanggung Jawab Mutlak{" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    {dataBiayaTransportasi?.file_sptjm && (
                      <a
                        onClick={() =>
                          window.open(
                            dataBiayaTransportasi?.file_sptjm!!,
                            "_blank",
                          )
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex items-center w-fit"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Lihat File Sebelumnya
                      </a>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="cursor-pointer"
                    onChange={(e) =>
                      setValue("sptjm", e.target.files?.[0]!!, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.sptjm && (
                    <p className="text-xs text-destructive">
                      {errors.sptjm.message as string}
                    </p>
                  )}
                </div>

                {/* Bukti Kwitansi */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">
                      Bukti Kwitansi <span className="text-destructive">*</span>
                    </Label>

                    {dataBiayaTransportasi?.file_bukti_kwitansi && (
                      <a
                        onClick={() =>
                          window.open(
                            dataBiayaTransportasi?.file_bukti_kwitansi!!,
                            "_blank",
                          )
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex items-center w-fit"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Lihat File Sebelumnya
                      </a>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="cursor-pointer"
                    onChange={(e) =>
                      setValue("bukti_kwitansi", e.target.files?.[0]!!, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.bukti_kwitansi && (
                    <p className="text-xs text-destructive">
                      {errors.bukti_kwitansi.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* ACTION */}
            <div className="flex justify-end">
              <Button type="submit">
                <Send className="h-4 w-4 mr-1" />
                Kirim Hasil Perbaikan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingDialog
        open={mutation.isPending}
        title="Mengirim hasil perbaikan"
      />
    </>
  );
};

export default RevisiDialog;
