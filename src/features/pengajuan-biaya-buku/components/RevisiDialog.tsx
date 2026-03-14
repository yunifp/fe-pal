import LoadingDialog from "@/components/LoadingDialog";
import { InfoItem } from "@/components/pks/InfoItem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { STALE_TIME } from "@/constants/reactQuery";
import { biayaBukuService } from "@/services/biayaBukuService";
import { pksService } from "@/services/pksService";
import {
  ajukanKeVerifikatorSchema,
  type AjukanKeVerifikatorFormData,
  type ITrxBiayaBukuPksWithPks,
} from "@/types/biayaBuku";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  RefreshCcw,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  dataBiayaBuku?: ITrxBiayaBukuPksWithPks | null;
}

const RevisiDialog = ({ open, setOpen, dataBiayaBuku }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<AjukanKeVerifikatorFormData>({
    resolver: zodResolver(ajukanKeVerifikatorSchema),
    defaultValues: {
      status_verifikasi: "hasil_perbaikan",
      daftar_nominatif: undefined,
    },
  });

  const {
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (!dataBiayaBuku) return;

    setValue("id_trx_pks", dataBiayaBuku.id_trx_pks!!);
    setValue("semester", dataBiayaBuku.semester!!);
    setValue("tahun", dataBiayaBuku.tahun!!);

    setValue(
      "total_mahasiswa",
      dataBiayaBuku.total_mahasiswa_aktif!! +
        dataBiayaBuku.total_mahasiswa_tidak_aktif!!,
    );

    setValue("total_mahasiswa_aktif", dataBiayaBuku.total_mahasiswa_aktif!!);

    setValue(
      "total_mahasiswa_tidak_aktif",
      dataBiayaBuku.total_mahasiswa_tidak_aktif!!,
    );

    setValue("jumlah_nominal", dataBiayaBuku.jumlah!!);
  }, [dataBiayaBuku, setValue]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: AjukanKeVerifikatorFormData) =>
      biayaBukuService.ajukanKeVerifikator(data),
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

  const onSubmit = (data: AjukanKeVerifikatorFormData) => {
    mutation.mutate(data);
  };

  // UPDATE JIKA JUMLAH MAHASISWA BARU

  const [isUpdatingMahasiswaBaru, setIsUpdatingMahasiswaBaru] =
    useState<boolean>(false);

  const [hasUpdateMahasiswaBaru, setHasUpdateMahasiswaBaru] = useState(false);

  const [isGeneratingNominatif, setIsGeneratingNominatif] =
    useState<boolean>(false);

  const updateMahasiswaBaru = async () => {
    if (!dataBiayaBuku?.id_trx_pks) return;
    if (hasGeneratedRef.current) return;

    if (!statistikMahasiswa || !pksDetail) {
      toast.error("Data mahasiswa atau detail PKS belum tersedia");
      return;
    }

    setIsUpdatingMahasiswaBaru(true);

    try {
      setHasUpdateMahasiswaBaru(true);
      hasGeneratedRef.current = true;

      await generateNominatifForForm();

      // update form values
      setValue(
        "total_mahasiswa",
        (statistikMahasiswa?.total_mahasiswa_aktif ?? 0) +
          (statistikMahasiswa?.total_mahasiswa_tidak_aktif ?? 0),
      );

      setValue(
        "total_mahasiswa_aktif",
        statistikMahasiswa?.total_mahasiswa_aktif ?? 0,
      );

      setValue(
        "total_mahasiswa_tidak_aktif",
        statistikMahasiswa?.total_mahasiswa_tidak_aktif ?? 0,
      );

      setValue(
        "jumlah_nominal",
        (statistikMahasiswa?.total_mahasiswa_aktif ?? 0) *
          (pksDetail?.biaya_buku_per_semester_per_mahasiswa ?? 0),
      );
    } catch (error) {
      toast.error("Gagal memperbarui mahasiswa");
    } finally {
      setIsUpdatingMahasiswaBaru(false);
    }
  };

  const { data: statistikMahasiswaResponse, isFetching: isFetchingStatistik } =
    useQuery({
      queryKey: ["pks", "statistik-mahasiswa", dataBiayaBuku?.id_trx_pks],
      queryFn: () =>
        pksService.getStatistikMahasiswa(dataBiayaBuku?.id_trx_pks!!),
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!dataBiayaBuku?.id_trx_pks,
      staleTime: STALE_TIME,
    });

  const statistikMahasiswa = statistikMahasiswaResponse?.data;

  const { data: pksDetailResponse, isFetching: isFetchingPks } = useQuery({
    queryKey: ["pks", "detail", dataBiayaBuku?.id_trx_pks],
    queryFn: () => pksService.getDetailPksById(dataBiayaBuku?.id_trx_pks!!),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!dataBiayaBuku?.id_trx_pks,
    staleTime: STALE_TIME,
  });

  const pksDetail = pksDetailResponse?.data;

  const totalBiayaBukuBaru =
    (statistikMahasiswa?.total_mahasiswa_aktif ?? 0) *
    (pksDetail?.biaya_buku_per_semester_per_mahasiswa ?? 0);

  const hasGeneratedRef = useRef(false);

  const [isDownloadingNominatif, setIsDownloadingNominatif] =
    useState<boolean>(false);

  // Generate nominatif baru jika jumlah mahasiswa diganti
  const generateNominatifForForm = async () => {
    setIsGeneratingNominatif(true);
    if (!dataBiayaBuku?.id_trx_pks) return;

    try {
      const blob = await biayaBukuService.generateNominatif(
        dataBiayaBuku?.id_trx_pks,
        dataBiayaBuku?.semester!!,
      );

      const file = new File([blob], "Daftar-Nominatif.pdf", {
        type: "application/pdf",
      });

      setValue("daftar_nominatif", file, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      toast.error("Gagal generate daftar nominatif otomatis");
    } finally {
      setIsGeneratingNominatif(false);
    }
  };

  const downloadNominatif = async () => {
    try {
      setIsDownloadingNominatif(true);

      const blob = await biayaBukuService.generateNominatif(
        dataBiayaBuku?.id_trx_pks!!,
        dataBiayaBuku?.semester!!,
      );

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      toast.error("Gagal mengunduh daftar nominatif");
    } finally {
      setIsDownloadingNominatif(false);
    }
  };

  const isLoadingData = isFetchingStatistik || isFetchingPks;

  const {
    data: hasPerubahanDataResponse,
    isLoading: isHasPerubahanDataLoading,
    isError: isHasPerubahanDataError,
  } = useQuery({
    queryKey: ["has-perubahan-data", dataBiayaBuku?.id_trx_pks],
    queryFn: () =>
      pksService.pksHasPerubahanDataMahasiswa(dataBiayaBuku?.id_trx_pks!!),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!dataBiayaBuku?.id_trx_pks,
  });

  const hasPerubahanData = hasPerubahanDataResponse?.data ?? "";

  const adaPerubahanData = hasPerubahanData === "Y";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="font-inter">
          <DialogHeader>
            <DialogTitle>Revisi Pengajuan dari Verifikator</DialogTitle>
            <DialogDescription>
              Pengajuan biaya buku memerlukan perbaikan sesuai catatan
              verifikator. Silakan lakukan revisi dan ajukan kembali.
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Catatan Verifikator</AlertTitle>
            <AlertDescription className="mt-1">
              {dataBiayaBuku?.catatan_verifikator ||
                "Tidak ada catatan dari verifikator."}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* hidden fields */}
            <input type="hidden" {...register("id_trx_pks")} />
            <input type="hidden" {...register("semester")} />
            <input type="hidden" {...register("tahun")} />
            <input type="hidden" {...register("total_mahasiswa")} />
            <input type="hidden" {...register("total_mahasiswa_aktif")} />
            <input type="hidden" {...register("total_mahasiswa_tidak_aktif")} />
            <input
              type="hidden"
              {...register("jumlah_nominal", { valueAsNumber: true })}
            />

            {/* INFORMASI PKS SAAT INI */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Informasi PKS</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <InfoItem label="Nomor PKS" value={dataBiayaBuku?.no_pks} />
                <InfoItem
                  label="Tanggal PKS"
                  value={formatTanggalIndo(dataBiayaBuku?.tanggal_pks)}
                />
                <InfoItem
                  label="Lembaga Pendidikan"
                  value={dataBiayaBuku?.lembaga_pendidikan}
                />
                <InfoItem label="Jenjang" value={dataBiayaBuku?.jenjang} />
                <InfoItem
                  label="Total Mahasiswa"
                  value={dataBiayaBuku?.total_mahasiswa}
                />
                <InfoItem
                  label="Total Mahasiswa Aktif"
                  value={dataBiayaBuku?.total_mahasiswa_aktif}
                />
                <InfoItem
                  label="Periode"
                  value={`Semester ${dataBiayaBuku?.semester}`}
                />
                <InfoItem
                  label="Total Biaya Buku"
                  value={formatRupiah(dataBiayaBuku?.jumlah!!)}
                />
              </div>
            </div>

            <Separator />

            {/* Loading State */}
            {isHasPerubahanDataLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengecek status perubahan data...
              </div>
            )}

            {/* Error State */}
            {isHasPerubahanDataError && (
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                <AlertDescription>
                  Gagal memeriksa status perubahan data mahasiswa. Silakan coba
                  lagi.
                </AlertDescription>
              </Alert>
            )}

            {/* Ada Perubahan Data */}
            {!isHasPerubahanDataLoading &&
              !isHasPerubahanDataError &&
              adaPerubahanData && (
                <Alert className="w-full border-yellow-500 text-yellow-700 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    Anda tidak bisa melakukan pengajuan biaya buku ke
                    verifikator
                  </AlertTitle>
                  <AlertDescription>
                    Terdapat perubahan data mahasiswa. Selesaikan terlebih
                    dahulu proses perubahan data di BPDP sebelum mengajukan ke
                    verifikator.
                  </AlertDescription>
                </Alert>
              )}

            {!isHasPerubahanDataLoading &&
              !isHasPerubahanDataError &&
              !adaPerubahanData && (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium">Perbarui Data Mahasiswa</p>
                    <p className="text-muted-foreground text-xs">
                      Ambil data mahasiswa terbaru dari sistem dan generate
                      daftar nominatif baru
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={updateMahasiswaBaru}
                    disabled={isUpdatingMahasiswaBaru}
                  >
                    {isUpdatingMahasiswaBaru ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}

                    {isUpdatingMahasiswaBaru
                      ? "Memperbarui..."
                      : "Update Mahasiswa Baru"}
                  </Button>
                </div>
              )}

            {hasUpdateMahasiswaBaru && (
              <>
                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-green-700">
                    Data Mahasiswa Terbaru
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total Mahasiswa Aktif
                      </span>

                      <p className="font-semibold text-green-700">
                        {isLoadingData ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          statistikMahasiswa?.total_mahasiswa_aktif
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Total Biaya Buku Baru
                      </span>

                      <p className="font-semibold text-green-700">
                        {isLoadingData ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          formatRupiah(totalBiayaBukuBaru)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

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

                    {dataBiayaBuku?.file_daftar_nominatif && (
                      <a
                        onClick={() =>
                          window.open(
                            dataBiayaBuku?.file_daftar_nominatif!!,
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
                  {isGeneratingNominatif && (
                    <Alert className="mt-2 border-blue-200 bg-blue-50 text-blue-800">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <AlertTitle className="text-blue-900">
                        Sedang memproses
                      </AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Sistem sedang men-generate daftar nominatif secara
                        otomatis. Mohon tunggu sebentar…
                      </AlertDescription>
                    </Alert>
                  )}
                  {!isGeneratingNominatif && watch("daftar_nominatif") && (
                    <Alert className="mt-2 border-green-200 bg-green-50 text-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />

                      <div className="flex flex-col gap-3 w-full">
                        <div>
                          <AlertTitle className="text-green-900">
                            Berhasil digenerate
                          </AlertTitle>

                          <AlertDescription className="text-green-700">
                            Daftar nominatif baru berhasil digenerate oleh
                            sistem.
                          </AlertDescription>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={downloadNominatif}
                          >
                            {isDownloadingNominatif ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4 mr-1" />
                            )}
                            {isDownloadingNominatif
                              ? "Memuat..."
                              : "Preview Daftar Nominatif Baru"}
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* ACTION */}
            {!isHasPerubahanDataLoading &&
              !isHasPerubahanDataError &&
              !adaPerubahanData && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-1" />
                      Kirim Hasil Perbaikan
                    </Button>
                  </div>
                </>
              )}
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
