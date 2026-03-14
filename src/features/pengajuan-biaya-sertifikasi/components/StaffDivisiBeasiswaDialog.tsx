import { CustInput } from "@/components/CustInput";
import { CustTextArea } from "@/components/CustTextArea";
import LoadingDialog from "@/components/LoadingDialog";
import { SignaturePad } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { STALE_TIME } from "@/constants/reactQuery";
import { biayaSertifikasiService } from "@/services/biayaSertifikasiService";
import {
  staffBeasiswaSchema,
  type ITrxBiayaSertifikasiPksWithPks,
  type StaffBeasiswaFormData,
} from "@/types/biayaSertifikasi";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  dataBiayaSertifikasi?: ITrxBiayaSertifikasiPksWithPks | null;
}

const StaffDivisiBeasiswaDialog = ({
  open,
  setOpen,
  dataBiayaSertifikasi,
}: Props) => {
  const queryClient = useQueryClient();

  // Setup untuk fetch biaya tahap lalu::start
  const {
    data: tagihanTahapLaluResponse,
    isLoading: tagihanTahapLaluIsLoading,
    isError: tagihanTahapLaluIsError,
  } = useQuery({
    queryKey: ["biaya-tahap-lalu", dataBiayaSertifikasi?.id],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaSertifikasiService.getTagihanTahapLalu(
        dataBiayaSertifikasi?.id!!,
      );
    },
    enabled: !!dataBiayaSertifikasi?.id,
    staleTime: STALE_TIME,
  });

  const tagihanTahapLalu: number = tagihanTahapLaluResponse?.data || 0;

  const form = useForm<StaffBeasiswaFormData>({
    resolver: zodResolver(staffBeasiswaSchema),
    defaultValues: {
      total_pagu: 0,
      tagihan_tahap_lalu: 0,
      tagihan_tahap_ini: 0,
      tagihan_sd_tahap_ini: 0,
      tagihan_sisa_dana: 0,
      verifikasi: "" as any,
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      total_pagu: dataBiayaSertifikasi?.jumlah || 0,
      tagihan_tahap_lalu: tagihanTahapLalu,
    });
  }, [dataBiayaSertifikasi, tagihanTahapLalu, reset]);

  // ✅ PERBAIKAN: Watch dengan sintaks yang benar
  const total_pagu = watch("total_pagu") || 0;
  const tagihan_tahap_lalu = watch("tagihan_tahap_lalu") || 0;
  const tagihan_tahap_ini = watch("tagihan_tahap_ini") || 0;
  const verifikasi = watch("verifikasi");

  // Auto-calculate saat ada perubahan
  useEffect(() => {
    const tagihan_sd_tahap_ini =
      (tagihan_tahap_lalu || 0) + (tagihan_tahap_ini || 0);
    const tagihan_sisa_dana = (total_pagu || 0) - tagihan_sd_tahap_ini;

    setValue("tagihan_sd_tahap_ini", tagihan_sd_tahap_ini, {
      shouldValidate: false,
    });

    setValue("tagihan_sisa_dana", tagihan_sisa_dana, {
      shouldValidate: false,
    });
  }, [total_pagu, tagihan_tahap_lalu, tagihan_tahap_ini, setValue]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: StaffBeasiswaFormData) =>
      biayaSertifikasiService.staffBeasiswa(dataBiayaSertifikasi?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-sertifikasi"],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "log-pengajuan",
            "biaya-sertifikasi",
            dataBiayaSertifikasi?.id,
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

  const onSubmit = (data: StaffBeasiswaFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="lg"
          className="font-inter max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Monitoring RAB</DialogTitle>
            <DialogDescription>
              Isi data di bawah untuk melanjutkan proses pengajuan biaya
              sertifikasi
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* INFO PKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nomor PKS</span>
                <p className="font-medium">
                  {dataBiayaSertifikasi?.no_pks || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Tanggal PKS</span>
                <p className="font-medium">
                  {formatTanggalIndo(dataBiayaSertifikasi?.tanggal_pks)}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Lembaga Pendidikan
                </span>
                <p className="font-medium">
                  {dataBiayaSertifikasi?.lembaga_pendidikan || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Jenjang</span>
                <p className="font-medium">
                  {dataBiayaSertifikasi?.jenjang || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Total Biaya Sertifikasi
                </span>
                <p className="font-medium">
                  {formatRupiah(dataBiayaSertifikasi?.jumlah!!)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  File Daftar Nominatif
                </Label>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    window.open(
                      dataBiayaSertifikasi?.file_daftar_nominatif!!,
                      "_blank",
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Unduh
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  File Salinan Bukti Pengeluaran
                </Label>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    window.open(
                      dataBiayaSertifikasi?.file_salinan_bukti_pengeluaran!!,
                      "_blank",
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Unduh
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  File Surat Pernyataan Tanggung Jawab Mutlak
                </Label>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    window.open(dataBiayaSertifikasi?.file_sptjm!!, "_blank");
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Unduh
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  File Bukti Kwitansi
                </Label>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    window.open(
                      dataBiayaSertifikasi?.file_bukti_kwitansi!!,
                      "_blank",
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Unduh
                </Button>
              </div>
            </div>

            <Separator />

            {/* Hasil Verifikasi */}
            <div className="space-y-2">
              <Label>
                Hasil Verifikasi
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <RadioGroup
                value={verifikasi}
                onValueChange={(value) =>
                  setValue("verifikasi", value as "setuju" | "kembalikan", {
                    shouldValidate: true,
                  })
                }
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="setuju" id="setuju" />
                  <Label
                    htmlFor="setuju"
                    className="font-normal cursor-pointer"
                  >
                    Setuju
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kembalikan" id="kembalikan" />
                  <Label
                    htmlFor="kembalikan"
                    className="font-normal cursor-pointer"
                  >
                    Kembalikan
                  </Label>
                </div>
              </RadioGroup>
              {errors.verifikasi && (
                <p className="text-sm text-destructive">
                  {errors.verifikasi.message}
                </p>
              )}
            </div>

            {/* Catatan Revisi - Tampil hanya jika kembalikan */}
            {verifikasi === "kembalikan" && (
              <>
                <CustTextArea
                  label="Catatan Revisi"
                  id="catatan_revisi"
                  placeholder="Masukkan catatan revisi"
                  isRequired
                  error={!!errors.catatan_revisi}
                  errorMessage={errors.catatan_revisi?.message}
                  {...register("catatan_revisi")}
                />
                {errors.catatan_revisi && (
                  <p className="text-sm text-destructive">
                    {errors.catatan_revisi.message}
                  </p>
                )}
              </>
            )}

            {/* Tagihan - Tampil hanya jika setuju */}
            {verifikasi === "setuju" && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Informasi Tagihan
                  </h3>
                  <p className="text-sm text-gray-500">
                    Masukkan detail tagihan tahap ini
                  </p>
                </div>

                {/* Grid Tagihan - 4 kolom di desktop, 1 di mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* TAGIHAN BULAN LALU */}
                  {tagihanTahapLaluIsLoading && (
                    <p>Memuat tagihan tahap lalu...</p>
                  )}
                  {tagihanTahapLaluIsError && (
                    <p>Terjadi kesalahan saat memuat tagihan tahap lalu. </p>
                  )}
                  {!tagihanTahapLaluIsLoading && tagihanTahapLalu > -1 && (
                    <CustInput
                      label="Tagihan Tahap Lalu"
                      id="tagihan_tahap_lalu"
                      placeholder="0"
                      type="number"
                      error={!!errors.tagihan_tahap_lalu}
                      errorMessage={errors?.tagihan_tahap_lalu?.message}
                      disabled={true}
                      {...register("tagihan_tahap_lalu", {
                        valueAsNumber: true,
                      })}
                    />
                  )}
                  {/* TAGIHAN BULAN INI */}
                  <CustInput
                    label="Tagihan Tahap Ini"
                    id="tagihan_tahap_ini"
                    placeholder="0"
                    type="number"
                    isRequired={true}
                    error={!!errors.tagihan_tahap_ini}
                    errorMessage={errors?.tagihan_tahap_ini?.message}
                    {...register("tagihan_tahap_ini", {
                      valueAsNumber: true,
                    })}
                  />

                  {/* TAGIHAN S/D BULAN INI (AUTO) */}
                  <CustInput
                    label="Tagihan s/d Tahap Ini"
                    id="tagihan_sd_tahap_ini"
                    placeholder="0"
                    type="number"
                    error={!!errors.tagihan_sd_tahap_ini}
                    errorMessage={errors?.tagihan_sd_tahap_ini?.message}
                    disabled={true}
                    {...register("tagihan_sd_tahap_ini", {
                      valueAsNumber: true,
                    })}
                  />

                  {/* SISA DANA (AUTO) */}
                  <CustInput
                    label="Sisa Dana"
                    id="tagihan_sisa_dana"
                    placeholder="0"
                    type="number"
                    error={!!errors.tagihan_sisa_dana}
                    errorMessage={errors?.tagihan_sisa_dana?.message}
                    disabled={true}
                    {...register("tagihan_sisa_dana", { valueAsNumber: true })}
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  {/* Section Header Signature */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tanda Tangan Persetujuan
                    </h3>
                    <p className="text-sm text-gray-500">
                      Bubuhkan tanda tangan Anda untuk menyetujui tagihan
                    </p>
                  </div>

                  {/* Signature Pad - Full width atau max-width */}
                  <div className="max-w-md">
                    <SignaturePad
                      label="Tanda Tangan"
                      isRequired={true}
                      onSave={(ttd) => setValue("ttd", ttd)}
                      error={!!errors.ttd}
                      errorMessage={errors?.ttd?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ACTION */}
            <div className="flex justify-end">
              <Button type="submit">
                <Send className="h-4 w-4 mr-1" />
                Kirim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingDialog open={mutation.isPending} title="Mengirim data" />
    </>
  );
};

export default StaffDivisiBeasiswaDialog;
