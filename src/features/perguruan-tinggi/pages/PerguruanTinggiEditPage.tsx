/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import {
  perguruanEditTinggiSchema,
  type PerguruanTinggiEditFormData,
} from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const PerguruanTinggiEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const perguruanTinggiId = parseInt(id ?? "");

  // State untuk preview gambar logo baru yang dipilih saat edit
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Validasi form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PerguruanTinggiEditFormData>({
    resolver: zodResolver(perguruanEditTinggiSchema),
    defaultValues: {},
  });

  // Mengambil data dari API
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["perguruan-tinggi", perguruanTinggiId],
    queryFn: () =>
      masterService.getDetailPerguruanTinggiById(perguruanTinggiId),
    enabled: !!perguruanTinggiId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const existingData = data?.data;

  // Mengatur nilai default form ketika data berhasil diambil
  useEffect(() => {
    if (!existingData) return;
    reset({
      namaPerguruanTinggi: existingData.nama_pt,
      kodePerguruanTinggi: existingData.kode_pt ?? "",
      singkatan: existingData.singkatan ?? "",
      jenis: existingData.jenis,
      alamat: existingData.alamat ?? "",
      kota: existingData.kota ?? "",
      kodePos: existingData.kode_pos ?? "",
      noTeleponPt: existingData.no_telepon_pt ?? "",
      faxPt: existingData.fax_pt ?? "",
      alamatEmail: existingData.email ?? "",
      alamatWebsite: existingData.website ?? "",
      namaDirektur: existingData.nama_pimpinan ?? "",
      jabatanPimpinan: existingData.jabatan_pimpinan ?? "",
      noTeleponPimpinan: existingData.no_telepon_pimpinan ?? "",
      noRekeningLembaga: existingData.no_rekening ?? "",
      namaBank: existingData.nama_bank ?? "",
      namaPenerimaTransfer: existingData.nama_penerima_transfer ?? "",
      npwp: existingData.npwp ?? "",
      statusAktif: existingData.status_aktif ?? 0,
      
      // Mengambil data Operator dan Verifikator dari database
      namaOperator: existingData.nama_operator ?? "",
      noTeleponOperator: existingData.no_telepon_operator ?? "",
      emailOperator: existingData.email_operator ?? "",
      namaVerifikator: existingData.nama_verifikator ?? "",
      noTeleponVerifikator: existingData.no_telepon_verifikator ?? "",
      emailVerifikator: existingData.email_verifikator ?? "",
    });
  }, [existingData, reset]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (formData: PerguruanTinggiEditFormData) =>
      masterService.updatePerguruanTinggiById(perguruanTinggiId, formData),
    onSuccess: (res: any) => {
      // Sesuaikan pembacaan "success" jika di backend response-nya berbeda
      toast.success(res?.message || "Berhasil memperbarui perguruan tinggi");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });
      queryClient.invalidateQueries({
        queryKey: ["perguruan-tinggi", perguruanTinggiId],
      });
      navigate("/master/perguruan-tinggi");
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (dataForm: PerguruanTinggiEditFormData) => {
    mutation.mutate(dataForm);
  };

  // Error handling untuk fetching data awal
  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  // Bersihkan object URL preview gambar saat komponen unmount
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  return (
    <>
      <CustBreadcrumb
        items={[
          { name: "Perguruan Tinggi", url: "/master/perguruan-tinggi" },
          { name: "Ubah Perguruan Tinggi" },
        ]}
      />
      <p className="text-xl font-semibold mt-4">Ubah Perguruan Tinggi</p>
      
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-center text-gray-500 py-4">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustInput
                  label="Nama Perguruan Tinggi"
                  placeholder="Masukkan nama perguruan tinggi"
                  {...register("namaPerguruanTinggi")}
                  error={!!errors.namaPerguruanTinggi}
                  errorMessage={errors.namaPerguruanTinggi?.message}
                />

                <CustInput
                  label="Kode Perguruan Tinggi"
                  placeholder="Masukkan kode perguruan tinggi"
                  {...register("kodePerguruanTinggi")}
                  error={!!errors.kodePerguruanTinggi}
                  errorMessage={errors.kodePerguruanTinggi?.message}
                />

                <CustInput
                  label="Singkatan"
                  placeholder="Contoh: UI, ITB"
                  {...register("singkatan")}
                  error={!!errors.singkatan}
                  errorMessage={errors.singkatan?.message}
                />

                <CustTextArea
                  label="Alamat"
                  placeholder="Masukkan alamat lengkap"
                  {...register("alamat")}
                  error={!!errors.alamat}
                  errorMessage={errors.alamat?.message}
                />

                <CustInput
                  label="Jenis Perguruan Tinggi"
                  placeholder="Negeri / Swasta"
                  {...register("jenis")}
                  error={!!errors.jenis}
                  errorMessage={errors.jenis?.message}
                />

                <CustInput
                  label="Nomor Telepon Perguruan Tinggi"
                  placeholder="08xxxxxxxxxx"
                  {...register("noTeleponPt")}
                  error={!!errors.noTeleponPt}
                  errorMessage={errors.noTeleponPt?.message}
                />

                <CustInput
                  label="Nomor Facsimile Perguruan Tinggi"
                  placeholder="08xxxxxxxxxx"
                  {...register("faxPt")}
                  error={!!errors.faxPt}
                  errorMessage={errors.faxPt?.message}
                />

                <CustInput
                  label="Kota"
                  placeholder="Nama kota"
                  {...register("kota")}
                  error={!!errors.kota}
                  errorMessage={errors.kota?.message}
                />

                <CustInput
                  label="Kode Pos"
                  placeholder="Kode pos"
                  {...register("kodePos")}
                  error={!!errors.kodePos}
                  errorMessage={errors.kodePos?.message}
                />

                <CustInput
                  label="Alamat Website"
                  placeholder="https://example.ac.id"
                  {...register("alamatWebsite")}
                  error={!!errors.alamatWebsite}
                  errorMessage={errors.alamatWebsite?.message}
                />

                <CustInput
                  label="Email"
                  type="email"
                  placeholder="email@kampus.ac.id"
                  {...register("alamatEmail")}
                  error={!!errors.alamatEmail}
                  errorMessage={errors.alamatEmail?.message}
                />

                <CustInput
                  label="Nama Direktur / Rektor"
                  placeholder="Nama pimpinan"
                  {...register("namaDirektur")}
                  error={!!errors.namaDirektur}
                  errorMessage={errors.namaDirektur?.message}
                />

                <CustInput
                  label="Jabatan Pimpinan"
                  placeholder="Jabatan pimpinan"
                  {...register("jabatanPimpinan")}
                  error={!!errors.jabatanPimpinan}
                  errorMessage={errors.jabatanPimpinan?.message}
                />

                <CustInput
                  label="Nomor Telepon Pimpinan"
                  placeholder="08xxxxxxxxxx"
                  {...register("noTeleponPimpinan")}
                  error={!!errors.noTeleponPimpinan}
                  errorMessage={errors.noTeleponPimpinan?.message}
                />

                <CustInput
                  label="Nomor Rekening Lembaga"
                  placeholder="Nomor rekening"
                  {...register("noRekeningLembaga")}
                  error={!!errors.noRekeningLembaga}
                  errorMessage={errors.noRekeningLembaga?.message}
                />

                <CustInput
                  label="Nama Bank"
                  placeholder="Nama bank"
                  {...register("namaBank")}
                  error={!!errors.namaBank}
                  errorMessage={errors.namaBank?.message}
                />

                <CustInput
                  label="Nama Penerima Transfer"
                  placeholder="Nama penerima"
                  {...register("namaPenerimaTransfer")}
                  error={!!errors.namaPenerimaTransfer}
                  errorMessage={errors.namaPenerimaTransfer?.message}
                />

                <CustInput
                  label="NPWP"
                  placeholder="Nomor NPWP"
                  {...register("npwp")}
                  error={!!errors.npwp}
                  errorMessage={errors.npwp?.message}
                />

                {/* ===== DATA OPERATOR ===== */}
                <div className="pt-4 mt-6 border-t">
                  <p className="font-semibold mb-4 text-gray-700">Data Operator</p>
                  <div className="space-y-4">
                    <CustInput
                      label="Nama Operator"
                      placeholder="Masukkan nama operator"
                      {...register("namaOperator")}
                      error={!!errors.namaOperator}
                      errorMessage={errors.namaOperator?.message}
                    />
                    <CustInput
                      label="Nomor Telepon Operator"
                      placeholder="08xxxxxxxxxx"
                      {...register("noTeleponOperator")}
                      error={!!errors.noTeleponOperator}
                      errorMessage={errors.noTeleponOperator?.message}
                    />
                    <CustInput
                      label="Email Operator"
                      type="email"
                      placeholder="operator@kampus.ac.id"
                      {...register("emailOperator")}
                      error={!!errors.emailOperator}
                      errorMessage={errors.emailOperator?.message}
                    />
                  </div>
                </div>

                {/* ===== DATA VERIFIKATOR ===== */}
                <div className="pt-4 mt-6 border-t">
                  <p className="font-semibold mb-4 text-gray-700">Data Verifikator</p>
                  <div className="space-y-4">
                    <CustInput
                      label="Nama Verifikator"
                      placeholder="Masukkan nama verifikator"
                      {...register("namaVerifikator")}
                      error={!!errors.namaVerifikator}
                      errorMessage={errors.namaVerifikator?.message}
                    />
                    <CustInput
                      label="Nomor Telepon Verifikator"
                      placeholder="08xxxxxxxxxx"
                      {...register("noTeleponVerifikator")}
                      error={!!errors.noTeleponVerifikator}
                      errorMessage={errors.noTeleponVerifikator?.message}
                    />
                    <CustInput
                      label="Email Verifikator"
                      type="email"
                      placeholder="verifikator@kampus.ac.id"
                      {...register("emailVerifikator")}
                      error={!!errors.emailVerifikator}
                      errorMessage={errors.emailVerifikator?.message}
                    />
                  </div>
                </div>

                {/* ===== BAGIAN LOGO ===== */}
                <div className="space-y-3 pt-4 border-t">
                  {/* Tampilkan preview dari file baru (logoPreview) jika ada, jika tidak tampilkan logo dari DB */}
                  {(logoPreview || existingData?.logo_path) && (
                    <img
                      src={logoPreview || existingData?.logo_path || undefined} // Tambahkan || undefined di sini
                      alt="Logo Perguruan Tinggi"
                      className="h-24 w-24 rounded-md border object-contain bg-white p-2"
                    />
                  )}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1">
                      Logo Lembaga
                    </Label>

                    <Input
                      type="file"
                      accept=".png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setValue("logoLembaga", file, {
                            shouldValidate: true,
                          });
                          // Update UI dengan preview file baru
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    <p className="text-xs text-muted-foreground">
                      Format file: PNG (maks. 5MB)
                    </p>

                    {errors.logoLembaga && (
                      <p className="text-xs text-destructive">
                        {errors.logoLembaga.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <Controller
                  control={control}
                  name="statusAktif"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="statusAktif"
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                      <label
                        htmlFor="statusAktif"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Status Aktif
                      </label>
                    </div>
                  )}
                />

                <div className="mt-8 flex items-center justify-between">
                  <Link to="/master/perguruan-tinggi">
                    <Button type="button" variant="secondary">
                      Kembali
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}
                  >
                    {isSubmitting || mutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PerguruanTinggiEditPage;