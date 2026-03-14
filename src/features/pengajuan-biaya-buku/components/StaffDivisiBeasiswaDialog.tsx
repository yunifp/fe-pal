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
import { biayaBukuService } from "@/services/biayaBukuService";
import {
  staffBeasiswaSchema,
  type ITrxBiayaBukuPksWithPks,
  type StaffBeasiswaFormData,
} from "@/types/biayaBuku";
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
  dataBiayaBuku?: ITrxBiayaBukuPksWithPks | null;
}

const StaffDivisiBeasiswaDialog = ({ open, setOpen, dataBiayaBuku }: Props) => {
  const queryClient = useQueryClient();

  // Setup untuk fetch biaya semester lalu::start
  const {
    data: tagihanSemesterLaluResponse,
    isLoading: tagihanSemesterLaluIsLoading,
    isError: tagihanSemesterLaluIsError,
  } = useQuery({
    queryKey: ["biaya-semester-lalu", dataBiayaBuku?.id],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaBukuService.getTagihanSemesterLalu(dataBiayaBuku?.id!!);
    },
    enabled: !!dataBiayaBuku?.id,
    staleTime: STALE_TIME,
  });

  const tagihanSemesterLalu: number = tagihanSemesterLaluResponse?.data || 0;

  const form = useForm<StaffBeasiswaFormData>({
    resolver: zodResolver(staffBeasiswaSchema),
    defaultValues: {
      total_pagu: 0,
      tagihan_semester_lalu: 0,
      tagihan_semester_ini: 0,
      tagihan_sd_semester_ini: 0,
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
      total_pagu: dataBiayaBuku?.biaya_buku || 0,
      jumlah_biaya_buku: dataBiayaBuku?.jumlah || 0,
      tagihan_semester_ini: dataBiayaBuku?.jumlah || 0,
      tagihan_semester_lalu: tagihanSemesterLalu,
    });
  }, [dataBiayaBuku, tagihanSemesterLalu, reset]);

  // ✅ PERBAIKAN: Watch dengan sintaks yang benar
  const total_pagu = watch("total_pagu") || 0;
  const jumlah_biaya_buku = Number(watch("jumlah_biaya_buku")) || 0;
  const tagihan_semester_lalu = watch("tagihan_semester_lalu") || 0;
  const tagihan_semester_ini = watch("tagihan_semester_ini") || 0;
  const tagihan_sd_semester_ini = watch("tagihan_sd_semester_ini") || 0;
  const tagihan_sisa_dana = watch("tagihan_sisa_dana") || 0;
  const verifikasi = watch("verifikasi");

  // Auto-calculate saat ada perubahan
  useEffect(() => {
    const tagihan_sd_semester_ini =
      (tagihan_semester_lalu || 0) + (tagihan_semester_ini || 0);
    const tagihan_sisa_dana = (total_pagu || 0) - tagihan_sd_semester_ini;

    setValue("tagihan_sd_semester_ini", tagihan_sd_semester_ini, {
      shouldValidate: false,
    });

    setValue("tagihan_sisa_dana", tagihan_sisa_dana, {
      shouldValidate: false,
    });
  }, [
    jumlah_biaya_buku,
    tagihan_semester_lalu,
    tagihan_semester_ini,
    setValue,
  ]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: StaffBeasiswaFormData) =>
      biayaBukuService.staffBeasiswa(dataBiayaBuku?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["pengajuan-biaya-buku"] });
        queryClient.invalidateQueries({
          queryKey: ["log-pengajuan", "biaya-buku", dataBiayaBuku?.id],
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
              Isi data di bawah untuk melanjutkan proses pengajuan biaya buku
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* INFO PKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nomor PKS</span>
                <p className="font-medium">{dataBiayaBuku?.no_pks || "-"}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Tanggal PKS</span>
                <p className="font-medium">
                  {formatTanggalIndo(dataBiayaBuku?.tanggal_pks)}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Lembaga Pendidikan
                </span>
                <p className="font-medium">
                  {dataBiayaBuku?.lembaga_pendidikan || "-"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Jenjang</span>
                <p className="font-medium">{dataBiayaBuku?.jenjang || "-"}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Semester</span>
                <p className="font-medium">
                  Semester {dataBiayaBuku?.semester}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Total Biaya Buku</span>
                <p className="font-medium">
                  {formatRupiah(dataBiayaBuku?.jumlah!!)}
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
                    Masukkan detail tagihan semester ini
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
                  {tagihanSemesterLaluIsLoading && (
                    <p>Memuat tagihan semester lalu...</p>
                  )}
                  {tagihanSemesterLaluIsError && (
                    <p>Terjadi kesalahan saat memuat tagihan semester lalu. </p>
                  )}
                  {!tagihanSemesterLaluIsLoading &&
                    tagihanSemesterLalu > -1 && (
                      <div className="space-y-1">
                        <Label>Tagihan Semester Lalu</Label>
                        {formatRupiah(tagihan_semester_lalu)}
                        <Input
                          type="hidden"
                          {...register("tagihan_semester_lalu", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    )}
                  {/* TAGIHAN BULAN INI */}
                  <div className="space-y-1">
                    <Label>Tagihan Semester Ini</Label>
                    {formatRupiah(tagihan_semester_ini)}
                    <Input
                      type="hidden"
                      {...register("tagihan_semester_ini")}
                    />
                  </div>

                  {/* TAGIHAN S/D BULAN INI (AUTO) */}
                  <div className="space-y-1">
                    <Label>Tagihan s/d Semester Ini</Label>
                    {formatRupiah(tagihan_sd_semester_ini)}
                    <Input
                      type="hidden"
                      {...register("tagihan_sd_semester_ini")}
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
