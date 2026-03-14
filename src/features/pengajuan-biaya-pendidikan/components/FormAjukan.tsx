import { STALE_TIME } from "@/constants/reactQuery";
import { pksService } from "@/services/pksService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader,
  Loader2,
  Send,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LoadingDialog from "@/components/LoadingDialog";
import {
  ajukanKeVerifikatorSchema,
  type AjukanKeVerifikatorFormData,
  type GetLockDataRequest,
} from "@/types/biayaPendidikan";
import { biayaPendidikanService } from "@/services/biayaPendidikanService";
import type { ITrxPks } from "@/types/pks";
import { CustSelect } from "@/components/ui/CustSelect";
import { getJumlahSemester } from "@/data/jenjangKuliah";
import { validitasIpkMahasiswaService } from "@/services/validitasIpkMahasiswaService";
import { validitasKeaktifanMahasiswaService } from "@/services/validitasKeaktifanMahasiswaService";

const FormAjukan = () => {
  const queryClient = useQueryClient();

  const [selectedPksId, setSelectedPksId] = useState<string>("");

  const [isDownloadingNominatif, setIsDownloadingNominatif] =
    useState<boolean>(false);

  const [isGeneratingNominatif, setIsGeneratingNominatif] =
    useState<boolean>(false);

  const [isDownloadingSptjm, setIsDownloadingSptjm] = useState<boolean>(false);

  const [isDownloadingBuktiKwitansi, setIsDownloadingBuktiKwitansi] =
    useState<boolean>(false);

  const form = useForm<AjukanKeVerifikatorFormData>({
    resolver: zodResolver(ajukanKeVerifikatorSchema),
    defaultValues: {
      status_verifikasi: "verifikasi",
      daftar_nominatif: undefined,
    },
  });

  const {
    handleSubmit,
    setValue,
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pks"],
    queryFn: () => pksService.getAllPks(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxPks[] = response?.data ?? [];

  const selectedPks = data.find((pks) => pks.id.toString() === selectedPksId);

  const { data: statistikMahasiswaResponse } = useQuery({
    queryKey: ["pks", "statistik-mahasiswa", selectedPks?.id],
    queryFn: () => pksService.getStatistikMahasiswa(selectedPks?.id!!),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const statistikMahasiswa = statistikMahasiswaResponse?.data;

  const semester = watch("semester");

  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!selectedPksId || !semester) return;
    if (hasGeneratedRef.current) return;

    hasGeneratedRef.current = true;
    generateNominatifForForm();
  }, [selectedPksId, semester]);

  const generateNominatifForForm = async () => {
    setIsGeneratingNominatif(true);
    if (!selectedPksId || !semester) return;

    try {
      const blob = await biayaPendidikanService.generateNominatif(
        parseInt(selectedPksId),
        semester,
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

      const blob = await biayaPendidikanService.generateNominatif(
        parseInt(selectedPksId),
        semester,
      );

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      toast.error("Gagal mengunduh daftar nominatif");
    } finally {
      setIsDownloadingNominatif(false);
    }
  };

  const downloadSptjm = async () => {
    try {
      setIsDownloadingSptjm(true);

      const blob = await biayaPendidikanService.generateSptjm({
        id_trx_pks: parseInt(selectedPksId),
        nominal: totalBiayaPendidikan,
        total_mahasiswa_aktif: statistikMahasiswa?.total_mahasiswa_aktif ?? 0,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "SPTJM.docx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error("Gagal mengunduh SPTJM");
    } finally {
      setIsDownloadingSptjm(false);
    }
  };

  const downloadBuktiKwitansi = async () => {
    try {
      setIsDownloadingBuktiKwitansi(true);

      const blob = await biayaPendidikanService.generateBuktiKwitansi({
        id_trx_pks: parseInt(selectedPksId),
        nominal: totalBiayaPendidikan,
        total_mahasiswa_aktif: statistikMahasiswa?.total_mahasiswa_aktif ?? 0,
        semester: Number(semester),
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "Bukti-Kwitansi.docx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error("Gagal mengunduh Kwitansi");
    } finally {
      setIsDownloadingBuktiKwitansi(false);
    }
  };

  const biayaSemester = Number(
    selectedPks?.[
      `biaya_pendidikan_semester_${semester}_per_mahasiswa` as keyof typeof selectedPks
    ] ?? 0,
  );

  const totalBiayaPendidikan =
    Number(statistikMahasiswa?.total_mahasiswa_aktif ?? 0) * biayaSemester;

  const now = new Date();

  const bulan = now.toLocaleString("id-ID", { month: "long" });
  const tahun = now.getFullYear().toString();

  const { data: getLockDataResponse, isLoading: isGetLockDataLoading } =
    useQuery({
      queryKey: [
        "pks",
        "mahasiswa",
        "lock-data",
        selectedPksId,
        semester,
        tahun,
      ],
      queryFn: () => {
        const data: GetLockDataRequest = {
          id_trx_pks: parseInt(selectedPksId),
          semester,
          tahun,
        };

        return biayaPendidikanService.getLockedDataPks(data);
      },
      enabled: !!selectedPksId && !!semester && !!tahun,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const sudahDiajukan = getLockDataResponse?.data === "Y";

  useEffect(() => {
    if (!selectedPks || !statistikMahasiswa) return;

    setValue("id_trx_pks", selectedPks.id);
    setValue("semester", semester);
    setValue("tahun", tahun);

    setValue(
      "total_mahasiswa",
      statistikMahasiswa.total_mahasiswa_aktif +
        statistikMahasiswa.total_mahasiswa_tidak_aktif,
    );

    setValue("total_mahasiswa_aktif", statistikMahasiswa.total_mahasiswa_aktif);

    setValue(
      "total_mahasiswa_tidak_aktif",
      statistikMahasiswa.total_mahasiswa_tidak_aktif,
    );

    setValue("jumlah_nominal", totalBiayaPendidikan);
  }, [
    selectedPks,
    statistikMahasiswa,
    semester,
    tahun,
    totalBiayaPendidikan,
    setValue,
  ]);

  const semesterOptions = useMemo(() => {
    if (!selectedPks?.jenjang) return [];

    const jumlahSemester = getJumlahSemester(selectedPks.jenjang);

    if (!jumlahSemester) return [];

    return Array.from({ length: jumlahSemester }, (_, index) => {
      const semester = index + 1;

      return {
        value: semester.toString(),
        label: `Semester ${semester}`,
      };
    });
  }, [selectedPks?.jenjang]);
  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: AjukanKeVerifikatorFormData) =>
      biayaPendidikanService.ajukanKeVerifikator(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-pendidikan"],
        });
        setSelectedPksId("");
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

  // Apakah masih ada mahasiswa yang belum di approve perubahan data
  const {
    data: hasPerubahanDataResponse,
    isLoading: isHasPerubahanDataLoading,
    isError: isHasPerubahanDataError,
  } = useQuery({
    queryKey: ["has-perubahan-data", selectedPksId],
    queryFn: () =>
      pksService.pksHasPerubahanDataMahasiswa(parseInt(selectedPksId)),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!selectedPksId,
  });

  const hasPerubahanData = hasPerubahanDataResponse?.data ?? "";

  const adaPerubahanData = hasPerubahanData === "Y";

  const {
    data: hasValiditasKeaktifanResponse,
    isLoading: isHasValiditasKeaktifanLoading,
    isError: isHasValiditasKeaktifanError,
  } = useQuery({
    queryKey: ["validitas-keaktifan-mahasiswa", selectedPksId],
    queryFn: () =>
      validitasKeaktifanMahasiswaService.getLockedDataPks({
        bulan: bulan,
        tahun: tahun,
        id_trx_pks: parseInt(selectedPksId),
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!selectedPksId,
  });

  const hasValiditasKeaktifan = hasValiditasKeaktifanResponse?.data ?? "";

  const keaktifanValid = hasValiditasKeaktifan === "Y";

  const {
    data: hasValiditasIpkResponse,
    isLoading: isHasValiditasIpkLoading,
    isError: isHasValiditasIpkError,
  } = useQuery({
    queryKey: ["validitas-ipk-mahasiswa", selectedPksId, semester],
    queryFn: () =>
      validitasIpkMahasiswaService.getLockedDataPks({
        semester: semester,
        id_trx_pks: parseInt(selectedPksId),
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!selectedPksId && !!semester,
  });

  const hasValiditasIpk = hasValiditasIpkResponse?.data ?? "";

  const ipkValid = hasValiditasIpk === "Y";

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat data PKS. Silakan coba lagi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Pilih Perjanjian Kerjasama (PKS)</CardTitle>
          <CardDescription>
            Silakan pilih PKS dari daftar di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pks-select">PKS</Label>
            <Select value={selectedPksId} onValueChange={setSelectedPksId}>
              <SelectTrigger id="pks-select" className="w-full">
                <SelectValue placeholder="Pilih PKS..." />
              </SelectTrigger>
              <SelectContent className="font-inter">
                {data.map((pks) => (
                  <SelectItem key={pks.id} value={pks.id.toString()}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {pks.no_pks || `PKS #${pks.id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pks.lembaga_pendidikan || "Lembaga tidak tersedia"} •{" "}
                          {pks.jenjang || "Jenjang tidak tersedia"} •{" "}
                          {pks.tahun_angkatan || "Jenjang tidak tersedia"}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPks && (
            <CustSelect
              name="semester"
              control={control}
              label="Semester"
              options={semesterOptions}
              placeholder="Pilih semester"
              error={errors.semester}
            />
          )}
        </CardContent>
      </Card>

      {selectedPks && semester && !sudahDiajukan && !isGetLockDataLoading && (
        <Card className="shadow-none mt-3">
          <CardContent>
            <div className="w-full flex flex-col items-end gap-3">
              {/* Status Perubahan Data */}
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
                    Gagal memeriksa status perubahan data mahasiswa. Silakan
                    coba lagi.
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
                      Anda tidak bisa melakukan pengajuan biaya pendidikan ke
                      verifikator
                    </AlertTitle>
                    <AlertDescription>
                      Terdapat perubahan data mahasiswa. Selesaikan terlebih
                      dahulu proses perubahan data di BPDP sebelum mengajukan ke
                      verifikator.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Keaktifan Mahasiswa */}
              {/* Loading State */}
              {isHasValiditasKeaktifanLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengecek validasi keaktifan mahasiswa...
                </div>
              )}

              {/* Error State */}
              {isHasValiditasKeaktifanError && (
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Terjadi Kesalahan</AlertTitle>
                  <AlertDescription>
                    Gagal memeriksa status validasi keaktifan mahasiswa. Silakan
                    coba lagi.
                  </AlertDescription>
                </Alert>
              )}

              {!isHasValiditasKeaktifanLoading &&
                !isHasValiditasKeaktifanError &&
                !keaktifanValid && (
                  <Alert className="w-full border-yellow-500 text-yellow-700 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      Anda belum melakukan validitas keaktifan mahasiswa pada
                      periode ini
                    </AlertTitle>
                    <AlertDescription className="mt-1 leading-relaxed">
                      Sistem mendeteksi bahwa validitas keaktifan mahasiswa
                      periode {bulan} {tahun} belum tersedia. Proses pengajuan
                      tidak dapat dilanjutkan sebelum validasi keaktifan
                      mahasiswa diselesaikan. Pastikan data mahasiswa telah
                      sesuai dan lakukan validasi terlebih dahulu.
                    </AlertDescription>
                  </Alert>
                )}

              {/* IPK */}
              {/* Loading State */}
              {isHasValiditasIpkLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengecek validitas IPK mahasiswa...
                </div>
              )}

              {/* Error State */}
              {isHasValiditasIpkError && (
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Terjadi Kesalahan</AlertTitle>
                  <AlertDescription>
                    Gagal memeriksa status validitas IPK mahasiswa. Silakan coba
                    lagi.
                  </AlertDescription>
                </Alert>
              )}

              {!isHasValiditasIpkLoading &&
                !isHasValiditasIpkError &&
                !ipkValid && (
                  <Alert className="w-full border-yellow-500 text-yellow-700 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      Anda belum melakukan validitas IPK mahasiswa pada semester
                      ini
                    </AlertTitle>
                    <AlertDescription className="mt-1 leading-relaxed">
                      Sistem mendeteksi bahwa validitas IPK mahasiswa semester{" "}
                      {semester} belum tersedia. Proses pengajuan tidak dapat
                      dilanjutkan sebelum validasi IPK mahasiswa diselesaikan.
                      Pastikan data mahasiswa telah sesuai dan lakukan validasi
                      terlebih dahulu.
                    </AlertDescription>
                  </Alert>
                )}
            </div>

            {!isHasPerubahanDataLoading &&
              !isHasPerubahanDataError &&
              !adaPerubahanData &&
              keaktifanValid &&
              ipkValid && (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Informasi PKS - Grid 3 Kolom */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="hidden" {...register("id_trx_pks")} />
                      <input type="hidden" {...register("semester")} />
                      <input type="hidden" {...register("tahun")} />
                      <input type="hidden" {...register("total_mahasiswa")} />
                      <input
                        type="hidden"
                        {...register("total_mahasiswa_aktif")}
                      />
                      <input
                        type="hidden"
                        {...register("total_mahasiswa_tidak_aktif")}
                      />
                      <input type="hidden" {...register("jumlah_nominal")} />
                      {/* Nomor PKS */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50">
                          <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Nomor PKS
                          </p>
                          <p className="font-semibold text-lg">
                            {selectedPks.no_pks || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Tanggal PKS */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Tanggal PKS
                          </p>
                          <p className="font-semibold text-lg">
                            {formatTanggalIndo(selectedPks.tanggal_pks)}
                          </p>
                        </div>
                      </div>

                      {/* Lembaga Pendidikan */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900">
                        <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                          <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Lembaga Pendidikan
                          </p>
                          <p className="font-semibold text-lg">
                            {selectedPks.lembaga_pendidikan || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Jenjang */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900">
                        <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                          <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Jenjang
                          </p>
                          <p className="font-semibold text-lg">
                            {selectedPks.jenjang || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Mahasiswa Aktif */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Mahasiswa Aktif
                          </p>
                          <p className="font-semibold text-lg">
                            {statistikMahasiswa?.total_mahasiswa_aktif}
                          </p>
                        </div>
                      </div>

                      {/* Mahasiswa Tidak Aktif */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                          <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Mahasiswa Tidak Aktif
                          </p>
                          <p className="font-semibold text-lg">
                            {statistikMahasiswa?.total_mahasiswa_tidak_aktif}
                          </p>
                        </div>
                      </div>

                      {/* Total Biaya Pendidikan */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                          <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Total Biaya Pendidikan
                          </p>
                          <p className="font-semibold text-lg">
                            {formatRupiah(totalBiayaPendidikan)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <Separator />

                    {/* Form Input - Grid dengan penjelasan lebih baik */}
                    <div className="space-y-6">
                      {/* ================= Daftar Nominatif ================= */}
                      <div className="border rounded-lg p-4 bg-muted/30 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Label className="text-base font-semibold">
                              Daftar Nominatif
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={downloadNominatif}
                            >
                              {isDownloadingNominatif ? (
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 mr-1" />
                              )}
                              Preview Daftar Nominatif
                            </Button>
                          </div>
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
                        {!isGeneratingNominatif &&
                          watch("daftar_nominatif") && (
                            <Alert className="mt-2 border-green-200 bg-green-50 text-green-800">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <AlertTitle className="text-green-900">
                                Berhasil digenerate
                              </AlertTitle>
                              <AlertDescription className="text-green-700">
                                Daftar nominatif berhasil digenerate oleh sistem
                                dan siap dikirim bersama dokumen lainnya.
                              </AlertDescription>
                            </Alert>
                          )}
                      </div>

                      {/* ================= Surat Pernyataan Tanggung Jawab Mutlak ================= */}
                      <div className="border rounded-lg p-4 bg-muted/30 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Label className="text-base font-semibold">
                              Surat Pernyataan Tanggung Jawab Mutlak
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={downloadSptjm}
                            >
                              {isDownloadingSptjm ? (
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-1" />
                              )}
                              {isDownloadingSptjm
                                ? "Memuat..."
                                : "Unduh Format"}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unduh Surat Pernyataan Tanggung Jawab Mutlak yang
                          telah digenerate sistem
                        </p>

                        <div className="mt-4 space-y-1">
                          <Label className="text-sm">
                            Upload Surat Pernyataan Tanggung Jawab Mutlak (Sudah
                            TTD)
                          </Label>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue("sptjm", file, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Format file: PDF yang sudah ditandatangani (maks.
                            5MB)
                          </p>
                          {errors.sptjm && (
                            <p className="text-xs text-destructive">
                              {errors.sptjm.message as string}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ================= Kwitansi ================= */}
                      <div className="border rounded-lg p-4 bg-muted/30 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Label className="text-base font-semibold">
                              Kwitansi
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={downloadBuktiKwitansi}
                            >
                              {isDownloadingBuktiKwitansi ? (
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-1" />
                              )}
                              {isDownloadingBuktiKwitansi
                                ? "Memuat..."
                                : "Unduh Format"}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unduh Kwitansi yang telah digenerate sistem
                        </p>

                        <div className="mt-4 space-y-1">
                          <Label className="text-sm">
                            Upload Kwitansi (Sudah TTD)
                          </Label>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue("bukti_kwitansi", file, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Format file: PDF yang sudah ditandatangani (maks.
                            5MB)
                          </p>
                          {errors.bukti_kwitansi && (
                            <p className="text-xs text-destructive">
                              {errors.bukti_kwitansi.message as string}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex justify-end">
                      <Button
                        type="submit"
                        disabled={
                          isHasPerubahanDataLoading ||
                          isHasPerubahanDataError ||
                          adaPerubahanData
                        }
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Ajukan Ke Verifikator
                      </Button>
                    </div>
                  </form>
                </>
              )}
          </CardContent>
        </Card>
      )}
      {selectedPks && sudahDiajukan && !isGetLockDataLoading && (
        <Card className="border-green-200 bg-green-50/60 dark:bg-green-950/20 shadow-none mt-3">
          <CardContent className="flex items-start gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-green-700 dark:text-green-300">
                Data Biaya Pendidikan Sudah Diajukan
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Pengajuan biaya pendidikan untuk PKS ini pada periode{" "}
                <b>Februari 2026</b> telah diajukan ke verifikator dan sedang
                menunggu proses verifikasi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <LoadingDialog open={isGetLockDataLoading} title="Megecek status" />

      <LoadingDialog
        open={mutation.isPending}
        title="Mengajukan ke verifikator"
      />
    </>
  );
};

export default FormAjukan;
