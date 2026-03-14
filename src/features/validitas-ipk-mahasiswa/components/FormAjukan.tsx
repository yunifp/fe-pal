import LoadingDialog from "@/components/LoadingDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CustSelect } from "@/components/ui/CustSelect";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { STALE_TIME } from "@/constants/reactQuery";
import { getJumlahSemester } from "@/data/jenjangKuliah";
import { pksService } from "@/services/pksService";
import { validitasIpkMahasiswaService } from "@/services/validitasIpkMahasiswaService";
import type { ITrxPks } from "@/types/pks";
import {
  ajukanValiditasIpkMahasiswaSchema,
  type AjukanValiditasIpkMahasiswaFormData,
  type GetLockDataRequest,
  type ListIpkWithMahasiswa,
} from "@/types/validitasIpkMahasiswa";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  TriangleAlert,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import ListIpk from "./ListIpk";

const FormAjukan = () => {
  const queryClient = useQueryClient();
  const [selectedPksId, setSelectedPksId] = useState<string>("");

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

  const form = useForm<AjukanValiditasIpkMahasiswaFormData>({
    resolver: zodResolver(ajukanValiditasIpkMahasiswaSchema),
  });

  const {
    handleSubmit,
    register,
    setValue,
    control,
    watch,
    formState: { errors },
  } = form;
  console.log(errors);
  const semester = watch("semester");

  const { data: getLockDataResponse, isLoading: isGetLockDataLoading } =
    useQuery({
      queryKey: [
        "validitas-ipk-mahasiswa",
        "lock-data",
        selectedPksId,
        semester,
      ],
      queryFn: () => {
        const data: GetLockDataRequest = {
          id_trx_pks: parseInt(selectedPksId),
          semester: semester!!.toString(),
        };

        return validitasIpkMahasiswaService.getLockedDataPks(data);
      },
      enabled: !!selectedPksId && !!semester,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const sudahDiajukan = getLockDataResponse?.data === "Y";

  const { data: statistikMahasiswaResponse } = useQuery({
    queryKey: ["pks", "statistik-mahasiswa", selectedPks?.id],
    queryFn: () => pksService.getStatistikMahasiswa(selectedPks?.id!!),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!selectedPks?.id,
  });

  const statistikMahasiswa = statistikMahasiswaResponse?.data;

  const {
    data: listIpkResponse,
    isLoading: isListIpkLoading,
    isError: isListIpkError,
  } = useQuery({
    queryKey: ["validitas-ipk-mahasiswa", "list-ipk", selectedPksId, semester],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      validitasIpkMahasiswaService.getListIpk(selectedPksId, semester!!),
    enabled: !!selectedPksId && !!semester,
    staleTime: STALE_TIME,
  });

  const listIpk: ListIpkWithMahasiswa[] = listIpkResponse?.data ?? [];

  useEffect(() => {
    if (!selectedPks || !statistikMahasiswa) return;

    setValue("id_trx_pks", selectedPks.id);
    setValue("semester", semester);

    setValue("total_mahasiswa_aktif", statistikMahasiswa.total_mahasiswa_aktif);
  }, [selectedPks, statistikMahasiswa, semester, setValue]);

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
    mutationFn: (data: AjukanValiditasIpkMahasiswaFormData) =>
      validitasIpkMahasiswaService.create(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["validitas-ipk-mahasiswa"],
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

  const onSubmit = (data: AjukanValiditasIpkMahasiswaFormData) => {
    const isiPernyataan =
      "Saya menyetujui dan menyatakan valid daftar IPK Semester {semester} yang telah diajukan dan disetujui oleh BPDP.";

    const payload = {
      ...data,
      semester: semester,
      isi_pernyataan: isiPernyataan,
    };

    mutation.mutate(payload);
  };

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Informasi PKS - Grid 3 Kolom */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="hidden"
                  {...register("id_trx_pks", { valueAsNumber: true })}
                />
                <input
                  type="hidden"
                  {...register("semester", { valueAsNumber: true })}
                />
                <input
                  type="hidden"
                  {...register("total_mahasiswa_aktif", {
                    valueAsNumber: true,
                  })}
                />

                {/* Nomor PKS */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50">
                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nomor PKS</p>
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
                    <p className="text-sm text-muted-foreground">Tanggal PKS</p>
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
                    <p className="text-sm text-muted-foreground">Jenjang</p>
                    <p className="font-semibold text-lg">
                      {selectedPks.jenjang || "-"}
                    </p>
                  </div>
                </div>

                {/* Periode */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-semibold text-lg">Semester {semester}</p>
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
              </div>

              <Separator className="my-6" />

              {!isListIpkLoading && isListIpkError && (
                <div className="container mx-auto p-6">
                  <Alert variant="destructive">
                    <AlertDescription>
                      Gagal memuat data IPK. Silakan coba lagi.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Kondisi: query sudah selesai (bukan loading, bukan error) */}
              {!isListIpkLoading && !isListIpkError && listIpkResponse && (
                <>
                  {listIpk.length === 0 ? (
                    // Semua data sudah di-update
                    <>
                      <Alert className="border-green-500 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                        <AlertTitle className="text-green-800 font-semibold">
                          Semua Data Sudah Diperbarui
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                          Anda sudah melakukan update pada semua data IPK.
                        </AlertDescription>
                      </Alert>

                      <Separator className="my-6" />

                      <Controller
                        name="pernyataan_disetujui"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="pernyataan-validitas"
                                checked={field.value}
                                onCheckedChange={(value) =>
                                  field.onChange(!!value)
                                }
                                className="mt-1"
                              />

                              <Label
                                htmlFor="pernyataan-validitas"
                                className="leading-relaxed cursor-pointer text-sm"
                              >
                                Saya menyetujui dan menyatakan valid daftar IPK
                                Semester {semester} yang telah diajukan dan
                                disetujui oleh BPDP.
                              </Label>
                            </div>

                            {fieldState.error && (
                              <p className="text-sm text-red-600 pl-7">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <div className="w-full flex justify-end">
                        <Button type="submit">
                          <CheckCircle2 className="h-4 w-4" />
                          Validasi
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Masih ada data yang belum di-update
                    <>
                      <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
                        <TriangleAlert className="h-4 w-4 stroke-yellow-600" />
                        <AlertTitle className="text-yellow-800 font-semibold">
                          Validasi Tidak Dapat Dilakukan
                        </AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          Masih terdapat data IPK yang belum di-update. Harap
                          perbarui semua data IPK terlebih dahulu sebelum
                          melakukan validasi.
                        </AlertDescription>
                      </Alert>

                      <ListIpk
                        idTrxPks={selectedPksId}
                        semester={semester}
                        data={listIpk}
                      />
                    </>
                  )}
                </>
              )}
            </form>
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
                Validitas IPK Mahasiswa Telah Divalidasi
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Validitas IPK mahasiswa untuk semester <b>{semester}</b> telah
                berhasil divalidasi dan dinyatakan sah.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <LoadingDialog open={isGetLockDataLoading} title="Megecek status" />

      <LoadingDialog open={mutation.isPending} title="Melakukan validasi" />
    </>
  );
};

export default FormAjukan;
