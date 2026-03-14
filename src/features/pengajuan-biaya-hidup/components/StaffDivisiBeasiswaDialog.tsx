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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { STALE_TIME } from "@/constants/reactQuery";
import { biayaHidupService } from "@/services/biayaHidupService";
import {
  staffBeasiswaSchema,
  type ITrxBiayaHidupPksWithPks,
  type StaffBeasiswaFormData,
} from "@/types/biayaHidup";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  dataBiayaHidup?: ITrxBiayaHidupPksWithPks | null;
}

const StaffDivisiBeasiswaDialog = ({
  open,
  setOpen,
  dataBiayaHidup,
}: Props) => {
  const queryClient = useQueryClient();

  // Setup untuk fetch biaya bulan lalu::start
  const {
    data: tagihanBulanLaluResponse,
    isLoading: tagihanBulanLaluIsLoading,
    isError: tagihanBulanLaluIsError,
  } = useQuery({
    queryKey: ["biaya-bulan-lalu", dataBiayaHidup?.id],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaHidupService.getTagihanBulanLalu(dataBiayaHidup?.id!!);
    },
    enabled: !!dataBiayaHidup?.id,
    staleTime: STALE_TIME,
  });

  const tagihanBulanLalu: number = tagihanBulanLaluResponse?.data || 0;

  const form = useForm<StaffBeasiswaFormData>({
    resolver: zodResolver(staffBeasiswaSchema),
    defaultValues: {
      jumlah_biaya_hidup: 0,
      tagihan_bulan_lalu: 0,
      tagihan_bulan_ini: 0,
      tagihan_sd_bulan_ini: 0,
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
      total_pagu: dataBiayaHidup?.biaya_hidup || 0,
      jumlah_biaya_hidup: dataBiayaHidup?.jumlah || 0,
      tagihan_bulan_lalu: tagihanBulanLalu,
      tagihan_bulan_ini: dataBiayaHidup?.jumlah || 0,
    });
  }, [dataBiayaHidup, tagihanBulanLalu, reset]);

  // ✅ PERBAIKAN: Watch dengan sintaks yang benar
  const total_pagu = Number(watch("total_pagu")) || 0;
  const jumlah_biaya_hidup = Number(watch("jumlah_biaya_hidup")) || 0;
  const tagihan_bulan_lalu = Number(watch("tagihan_bulan_lalu")) || 0;
  const tagihan_bulan_ini = Number(watch("tagihan_bulan_ini")) || 0;
  const tagihan_sd_bulan_ini = Number(watch("tagihan_sd_bulan_ini")) || 0;
  const tagihan_sisa_dana = Number(watch("tagihan_sisa_dana")) || 0;
  const verifikasi = watch("verifikasi");

  // Auto-calculate saat ada perubahan
  useEffect(() => {
    const tagihan_sd_bulan_ini =
      (tagihan_bulan_lalu || 0) + (tagihan_bulan_ini || 0);
    const tagihan_sisa_dana = (total_pagu || 0) - tagihan_sd_bulan_ini;

    setValue("tagihan_sd_bulan_ini", tagihan_sd_bulan_ini, {
      shouldValidate: false,
    });

    setValue("tagihan_sisa_dana", tagihan_sisa_dana, {
      shouldValidate: false,
    });
  }, [jumlah_biaya_hidup, tagihan_bulan_lalu, tagihan_bulan_ini, setValue]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: StaffBeasiswaFormData) =>
      biayaHidupService.staffBeasiswa(dataBiayaHidup?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["pengajuan-biaya-hidup"] });
        queryClient.invalidateQueries({
          queryKey: ["log-pengajuan", "biaya-hidup", dataBiayaHidup?.id],
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
              Isi data di bawah untuk melanjutkan proses pengajuan biaya hidup
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* INFO PKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nomor PKS</span>
                <p className="font-medium">{dataBiayaHidup?.no_pks || "-"}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Tanggal PKS</span>
                <p className="font-medium">
                  {formatTanggalIndo(dataBiayaHidup?.tanggal_pks)}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Lembaga Pendidikan
                </span>
                <p className="font-medium">
                  {dataBiayaHidup?.lembaga_pendidikan || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Jenjang</span>
                <p className="font-medium">{dataBiayaHidup?.jenjang || "-"}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Periode</span>
                <p className="font-medium">
                  {dataBiayaHidup?.bulan} {dataBiayaHidup?.tahun}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Total Biaya Hidup</span>
                <p className="font-medium">
                  {formatRupiah(dataBiayaHidup?.jumlah!!)}
                </p>
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
                    Masukkan detail tagihan bulan ini
                  </p>
                </div>

                {/* Grid Tagihan - 4 kolom di desktop, 1 di mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Pagu */}
                  <div className="space-y-1">
                    <Label>Total Pagu</Label>
                    {formatRupiah(total_pagu)}
                  </div>

                  {/* TAGIHAN BULAN LALU */}
                  {tagihanBulanLaluIsLoading && (
                    <p>Memuat tagihan bulan lalu...</p>
                  )}
                  {tagihanBulanLaluIsError && (
                    <p>Terjadi kesalahan saat memuat tagihan bulan lalu. </p>
                  )}
                  {!tagihanBulanLaluIsLoading && tagihanBulanLalu > -1 && (
                    <div className="space-y-1">
                      <Label>Tagihan Bulan Lalu</Label>
                      {formatRupiah(tagihan_bulan_lalu)}
                      <Input
                        type="hidden"
                        {...register("tagihan_bulan_lalu", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  )}
                  {/* TAGIHAN BULAN INI */}
                  <div className="space-y-1">
                    <Label>Tagihan Bulan Ini</Label>
                    {formatRupiah(tagihan_bulan_ini)}
                    <Input type="hidden" {...register("tagihan_bulan_ini")} />
                  </div>

                  {/* TAGIHAN S/D BULAN INI (AUTO) */}
                  <div className="space-y-1">
                    <Label>Tagihan s/d Bulan Ini</Label>
                    {formatRupiah(tagihan_sd_bulan_ini)}
                    <Input
                      type="hidden"
                      {...register("tagihan_sd_bulan_ini")}
                    />
                  </div>
                  {/* SISA DANA (AUTO) */}
                  <div className="space-y-1">
                    <Label>Sisa Dana</Label>
                    {formatRupiah(tagihan_sisa_dana)}
                    <Input type="hidden" {...register("tagihan_sisa_dana")} />
                  </div>
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
