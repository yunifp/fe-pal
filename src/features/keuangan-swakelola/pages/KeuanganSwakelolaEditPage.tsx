import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CustInput } from "@/components/CustInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect, useMemo } from "react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  pksSwakelolaEditSchema,
  type ITrxPks,
  type PksSwakelolaEditFormData,
} from "@/types/pks";
import { pksService } from "@/services/pksService";
import { CustSelect } from "@/components/ui/CustSelect";
import { getJumlahSemester } from "@/data/jenjangKuliah";
import { Calculator, FileText, Wallet } from "lucide-react";
import { formatRupiah } from "@/utils/stringFormatter";
import { CustInputRupiah } from "@/components/CustInputRupiah";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PksSelector } from "../components/PksSelector";
import LoadingDialog from "@/components/LoadingDialog";
import type { AxiosError } from "axios";
import { ErrorState } from "@/components/ErrorState";
import { getErrorType } from "@/utils/networkHandler";

function mapPendidikanFromDetail(detailData: any) {
  const result = [];

  for (let i = 1; i <= 8; i++) {
    const biaya = detailData[`biaya_pendidikan_semester_${i}`];
    const biayaPerMahasiswa =
      detailData[`biaya_pendidikan_semester_${i}_per_mahasiswa`];

    // kalau null / 0 semua, skip
    if (!biaya && !biayaPerMahasiswa) continue;

    result.push({
      semester: i,
      biaya: Number(biaya ?? 0),
      biaya_per_mahasiswa: Number(biayaPerMahasiswa ?? 0),
    });
  }

  return result;
}

const KeuanganSwakelolaEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { idTrxPks } = useParams();

  // Mengambil data dari API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pks", idTrxPks],
    queryFn: () => pksService.getDetailPksSwakelolaById(Number(idTrxPks!!)),
    enabled: !!idTrxPks,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const detailData = data?.data;

  console.log(detailData);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<PksSwakelolaEditFormData>({
    resolver: zodResolver(pksSwakelolaEditSchema),
    defaultValues: {
      jumlah_mahasiswa: 0,
      is_swakelola: "Y",
      pks_sebelumnya: [],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (detailData) {
      console.log(detailData);
      reset({
        is_swakelola: "N",
        no_pks: detailData.no_pks ?? "",
        tanggal_pks: detailData.tanggal_pks ?? "",
        tanggal_awal_pks: detailData.tanggal_awal_pks ?? "",
        tanggal_akhir_pks: detailData.tanggal_akhir_pks ?? "",

        lembaga_pendidikan:
          (detailData.id_lembaga_pendidikan ?? "") +
          "#" +
          (detailData.lembaga_pendidikan ?? ""),

        jenjang:
          (detailData.id_jenjang ?? "") + "#" + (detailData.jenjang ?? ""),

        tahun: detailData.tahun_angkatan ?? "",
        jumlah_mahasiswa: detailData.jumlah_mahasiswa ?? 0,

        biaya_hidup: Number(detailData.biaya_hidup ?? 0),
        biaya_buku: Number(detailData.biaya_buku ?? 0),
        biaya_transportasi: Number(detailData.biaya_transportasi ?? 0),
        biaya_sertifikasi_kompetensi: Number(
          detailData.biaya_sertifikasi_kompetensi ?? 0,
        ),

        biaya_pendidikan: Number(detailData.biaya_pendidikan ?? 0),

        pendidikan: mapPendidikanFromDetail(detailData),

        pks_sebelumnya: detailData.pks_sebelumnya ?? [],
      });
    }
  }, [detailData]);

  const biayaHidup = watch("biaya_hidup") || 0;
  const biayaBuku = watch("biaya_buku") || 0;
  const biayaTransportasi = watch("biaya_transportasi") || 0;
  const biayaSertifikasi = watch("biaya_sertifikasi_kompetensi") || 0;

  const jumlahMahasiswa = watch("jumlah_mahasiswa") || 0;

  const jenjang = watch("jenjang") || "";
  const namaJenjang = jenjang?.split("#")[1] || "";

  const jumlahSemester = getJumlahSemester(namaJenjang) || 0;
  const semesters = Array.from({ length: jumlahSemester }, (_, i) => i + 1);

  const biayaHidupPerBulan = biayaHidup / 6 / jumlahSemester;
  const biayaHidupPerBulanPerMahasiswa = biayaHidupPerBulan / jumlahMahasiswa;

  const pendidikan = useWatch({
    control,
    name: "pendidikan",
  });

  const lembaga_pendidikan = watch("lembaga_pendidikan") || "";

  const id_lembaga_pendidikan = useMemo(() => {
    if (!lembaga_pendidikan) return null;
    const [id] = lembaga_pendidikan.split("#");
    return parseInt(id);
  }, [lembaga_pendidikan]);

  const id_jenjang = useMemo(() => {
    if (!jenjang) return null;
    const [id] = jenjang.split("#");
    return parseInt(id);
  }, [jenjang]);

  const totalBiayaPendidikan = useMemo(() => {
    if (!pendidikan) return 0;

    return pendidikan
      .slice(0, jumlahSemester)
      .reduce((acc, item) => acc + (item?.biaya ?? 0), 0);
  }, [pendidikan, jumlahSemester]);

  useEffect(() => {
    setValue("biaya_pendidikan", totalBiayaPendidikan, {
      shouldValidate: true,
    });
  }, [totalBiayaPendidikan, setValue]);

  const biayaBukuPerSemester = biayaBuku / jumlahSemester;
  const biayaBukuPerSemesterPerMahasiswa =
    biayaBukuPerSemester / jumlahMahasiswa;

  const biayaTransportasiPerTahap = biayaTransportasi / 2;
  const biayaTransportasiPerTahapPerMahasiswa =
    biayaTransportasiPerTahap / jumlahMahasiswa;

  const biayaSertifikasiPerMahasiswa = biayaSertifikasi / jumlahMahasiswa;

  const biayaFields = useWatch({
    control,
    name: [
      "biaya_hidup",
      "biaya_pendidikan",
      "biaya_buku",
      "biaya_transportasi",
      "biaya_sertifikasi_kompetensi",
    ],
  });

  const nilaiPks = useMemo(() => {
    return biayaFields.reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [biayaFields]);

  // Mengambil lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt + "#" + data.nama_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

  // Mengambil jenjang
  const { data: jenjangData } = useQuery({
    queryKey: ["jenjang-kuliah"],
    queryFn: () => masterService.getJenjangKuliah(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jenjangOptions = useMemo(() => {
    return (
      jenjangData?.data?.map((data) => ({
        value: String(data.id + "#" + data.nama),
        label: data.nama,
      })) || []
    );
  }, [jenjangData]);

  // Mengambil pks sebelumnya
  const pksSebelumnyaValue = watch("pks_sebelumnya");
  const { data: pksSebelumnyaData } = useQuery({
    queryKey: ["pks-swakelola-sebelumnya", id_lembaga_pendidikan, id_jenjang],
    queryFn: () =>
      pksService.getAllPks(id_lembaga_pendidikan, id_jenjang, "swakelola"),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: !!id_lembaga_pendidikan && !!id_jenjang,
  });

  const pksSebelumnya: ITrxPks[] = pksSebelumnyaData?.data || [];

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: PksSwakelolaEditFormData) =>
      pksService.editPksSwakelola(idTrxPks!!, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pks"],
        });
        queryClient.invalidateQueries({
          queryKey: ["pks-swakelola-sebelumnya"],
          exact: false,
        });
        navigate("/database/keuangan-swakelola");
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

  useEffect(() => {
    const current = form.getValues("pendidikan") || [];

    if (current.length > jumlahSemester) {
      form.setValue("pendidikan", current.slice(0, jumlahSemester), {
        shouldValidate: true,
      });
    }

    if (current.length < jumlahSemester) {
      const newData = [...current];

      for (let i = current.length; i < jumlahSemester; i++) {
        newData.push({
          semester: i + 1,
          biaya: 0,
          biaya_per_mahasiswa: 0,
        });
      }

      form.setValue("pendidikan", newData, {
        shouldValidate: true,
      });
    }
  }, [jumlahSemester]);

  const onSubmit = (data: PksSwakelolaEditFormData) => {
    console.log("form values:", form.getValues("pks_sebelumnya"));
    const jumlahMahasiswa = data.jumlah_mahasiswa ?? 0;

    let totalPendidikan = 0;
    const semesterFields: any = {};
    const semesterPerMahasiswa: any = {};

    data.pendidikan?.forEach((item, index) => {
      const semesterNumber = index + 1;
      const semesterValue = item.biaya ?? 0;

      totalPendidikan += semesterValue;

      semesterFields[`biaya_pendidikan_semester_${semesterNumber}`] =
        semesterValue;

      semesterPerMahasiswa[
        `biaya_pendidikan_semester_${semesterNumber}_per_mahasiswa`
      ] = jumlahMahasiswa > 0 ? semesterValue / jumlahMahasiswa : 0;
    });

    // 🔥 Hilangkan pendidikan dari object
    const { pendidikan, ...rest } = data;

    const finalValue = {
      ...rest,

      biaya_pendidikan: totalPendidikan,

      ...semesterFields,
      ...semesterPerMahasiswa,

      biaya_hidup_per_bulan: biayaHidupPerBulan,
      biaya_hidup_per_bulan_per_mahasiswa: biayaHidupPerBulanPerMahasiswa,

      biaya_buku_per_semester: biayaBukuPerSemester,
      biaya_buku_per_semester_per_mahasiswa: biayaBukuPerSemesterPerMahasiswa,

      biaya_sertifikasi_kompetensi_per_mahasiswa: biayaSertifikasiPerMahasiswa,

      biaya_transportasi_per_tahap: biayaTransportasiPerTahap,
      biaya_transportasi_per_tahap_per_mahasiswa:
        biayaTransportasiPerTahapPerMahasiswa,
    };
    console.log("pks_sebelumnya di finalValue:", finalValue.pks_sebelumnya);
    mutation.mutate(finalValue);
  };

  if (isLoading) return <LoadingDialog open={true} title="Mengambil data" />;

  if (isError) {
    const axiosError = error as AxiosError<{ message: string }>;

    return (
      <ErrorState
        type={getErrorType(error)}
        code={axiosError?.response?.status}
        message={axiosError?.response?.data?.message} // ← "Data PKS tidak ditemukan"
        detail={axiosError?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Keuangan Swakelola",
            url: "/database/keuangan-swakelola",
          },
          { name: "Tambah Keuangan Swakelola" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Tambah Keuangan Swakelola</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full shadow-none">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* ======================= INFORMASI PKS ======================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-500">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Informasi PKS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustInput
                      id="no_pks"
                      label="No. PKS"
                      placeholder="Cth: PKS/SAWIT/2024/001"
                      error={!!errors.no_pks}
                      errorMessage={errors.no_pks?.message}
                      isRequired={true}
                      {...register("no_pks")}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustInput
                      id="tanggal_pks"
                      label="Tanggal PKS"
                      type="date"
                      error={!!errors.tanggal_pks}
                      errorMessage={errors.tanggal_pks?.message}
                      isRequired={true}
                      {...register("tanggal_pks")}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustInput
                      id="tanggal_awal_pks"
                      label="Tanggal Awal PKS"
                      type="date"
                      error={!!errors.tanggal_awal_pks}
                      errorMessage={errors.tanggal_awal_pks?.message}
                      isRequired={true}
                      {...register("tanggal_awal_pks")}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustInput
                      id="tanggal_akhir_pks"
                      label="Tanggal Akhir PKS"
                      type="date"
                      error={!!errors.tanggal_akhir_pks}
                      errorMessage={errors.tanggal_akhir_pks?.message}
                      isRequired={true}
                      {...register("tanggal_akhir_pks")}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        File PKS
                      </Label>

                      <Input
                        type="file"
                        accept=".pdf"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValue("file_pks", file, {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />

                      {errors.file_pks && (
                        <p className="text-xs text-destructive">
                          {errors.file_pks.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustSearchableSelect
                      name="lembaga_pendidikan"
                      control={control}
                      label="Lembaga Pendidikan"
                      options={lembagaPendidikanOptions}
                      placeholder="Pilih lembaga pendidikan"
                      isRequired
                      error={errors.lembaga_pendidikan}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CustSelect
                      name="jenjang"
                      control={control}
                      label="Jenjang"
                      options={jenjangOptions}
                      placeholder="Pilih jenjang"
                      isRequired={true}
                      error={errors.jenjang}
                    />
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <CustInput
                      id="tahun"
                      label="Tahun"
                      error={!!errors.tahun}
                      errorMessage={errors.tahun?.message}
                      isRequired={true}
                      {...register("tahun")}
                    />
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <CustInput
                      id="jumlah_mahasiswa"
                      label="Jumlah Mahasiswa"
                      error={!!errors.jumlah_mahasiswa}
                      errorMessage={errors.jumlah_mahasiswa?.message}
                      {...register("jumlah_mahasiswa", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* ======================= PKS REFERENSI ======================= */}
              <div className="mt-4">
                <PksSelector
                  pkss={pksSebelumnya}
                  value={pksSebelumnyaValue}
                  onChange={(selectedIds) => {
                    setValue("pks_sebelumnya", selectedIds, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              </div>

              {/* ======================= RINCIAN BIAYA ======================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-orange-500">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Rincian Biaya
                  </h2>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Biaya</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {/* Biaya Hidup */}
                    <TableRow>
                      <TableCell className="font-medium">Biaya Hidup</TableCell>

                      <TableCell>
                        <CustInputRupiah
                          id="biaya_hidup"
                          value={biayaHidup}
                          error={!!errors.biaya_hidup}
                          errorMessage={errors.biaya_hidup?.message}
                          onValueChange={(val) => {
                            setValue("biaya_hidup", val, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        Per Bulan: {formatRupiah(biayaHidupPerBulan)}
                      </TableCell>

                      <TableCell>
                        Per Bulan & Per Mahasiswa:{" "}
                        {formatRupiah(biayaHidupPerBulanPerMahasiswa)}
                      </TableCell>
                    </TableRow>

                    {/* Biaya Buku */}
                    <TableRow>
                      <TableCell className="font-medium">Biaya Buku</TableCell>

                      <TableCell>
                        <CustInputRupiah
                          id="biaya_buku"
                          value={biayaBuku}
                          error={!!errors.biaya_buku}
                          errorMessage={errors.biaya_buku?.message}
                          onValueChange={(val) => {
                            setValue("biaya_buku", val, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        Per Semester: {formatRupiah(biayaBukuPerSemester)}
                      </TableCell>

                      <TableCell>
                        Per Semester & Per Mahasiswa:{" "}
                        {formatRupiah(biayaBukuPerSemesterPerMahasiswa)}
                      </TableCell>
                    </TableRow>

                    {/* Biaya Transportasi */}
                    <TableRow>
                      <TableCell className="font-medium">
                        Biaya Transportasi
                      </TableCell>

                      <TableCell>
                        <CustInputRupiah
                          id="biaya_transportasi"
                          value={biayaTransportasi}
                          error={!!errors.biaya_transportasi}
                          errorMessage={errors.biaya_transportasi?.message}
                          onValueChange={(val) => {
                            setValue("biaya_transportasi", val, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        Per Tahap <br />
                        (Keberangkatan/Kepulangan):{" "}
                        {formatRupiah(biayaTransportasiPerTahap)}
                      </TableCell>

                      <TableCell>
                        Per Tahap & Per Mahasiswa:{" "}
                        {formatRupiah(biayaTransportasiPerTahapPerMahasiswa)}
                      </TableCell>
                    </TableRow>

                    {/* Biaya Sertifikasi */}
                    <TableRow>
                      <TableCell className="font-medium">
                        Biaya Sertifikasi
                      </TableCell>

                      <TableCell>
                        <CustInputRupiah
                          id="biaya_sertifikasi_kompetensi"
                          value={biayaSertifikasi}
                          error={!!errors.biaya_sertifikasi_kompetensi}
                          errorMessage={
                            errors.biaya_sertifikasi_kompetensi?.message
                          }
                          onValueChange={(val) => {
                            setValue("biaya_sertifikasi_kompetensi", val, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell></TableCell>

                      <TableCell>
                        Per Mahasiswa:{" "}
                        {formatRupiah(biayaSertifikasiPerMahasiswa)}
                      </TableCell>
                    </TableRow>

                    {/* Biaya Pendidikan */}
                    <TableRow>
                      <TableCell className="font-medium">
                        Biaya Pendidikan
                      </TableCell>

                      <TableCell>
                        {formatRupiah(totalBiayaPendidikan)}
                        <span className="block text-xs text-muted-foreground">
                          Otomatis terisi
                        </span>
                      </TableCell>

                      <TableCell />
                      <TableCell />
                    </TableRow>

                    {semesters.map((semester, index) => {
                      const biaya = pendidikan?.[index]?.biaya || 0;

                      const biayaPerMahasiswa =
                        jumlahMahasiswa > 0 ? biaya / jumlahMahasiswa : 0;

                      return (
                        <TableRow key={semester}>
                          <TableCell className="font-medium text-right">
                            - Semester {semester}
                          </TableCell>

                          {/* INPUT BIAYA */}
                          <TableCell>
                            <input
                              type="hidden"
                              {...register(`pendidikan.${index}.semester`, {
                                valueAsNumber: true,
                              })}
                              value={semester}
                            />
                            <Controller
                              control={control}
                              name={`pendidikan.${index}.biaya`}
                              render={({ field }) => (
                                <CustInputRupiah
                                  value={field.value}
                                  error={!!errors.pendidikan?.[index]?.biaya}
                                  errorMessage={
                                    errors.pendidikan?.[index]?.biaya?.message
                                  }
                                  onValueChange={(val) => {
                                    const numericValue = val
                                      ? Number(
                                          val.toString().replace(/\./g, ""),
                                        )
                                      : 0;

                                    field.onChange(numericValue);
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          <TableCell />

                          {/* AUTO CALCULATE (NO INPUT) */}
                          <TableCell>
                            Per Mahasiswa: {formatRupiah(biayaPerMahasiswa)}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {(!semesters || semesters.length === 0) && (
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                          <span className="text-red-500 text-xs">
                            Isi field jenjang terlebih dahulu
                          </span>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ======================= TOTAL PKS ======================= */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <span className="text-lg font-medium">Total Nilai PKS</span>
                  </div>
                  <span className="text-3xl font-bold">
                    {formatRupiah(nilaiPks)}
                  </span>
                </div>
              </div>

              {/* ================= ACTION ================= */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <Link to="/database/keuangan-swakelola">
                  <Button type="button" variant="outline">
                    Kembali
                  </Button>
                </Link>

                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default KeuanganSwakelolaEditPage;
