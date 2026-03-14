/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import {
  perguruanEditTinggiSchema,
  type PerguruanTinggiEditFormData,
} from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PerguruanTinggiCreatePage = () => {
  // Gunakan "C" untuk memverifikasi hak akses Create
  useRedirectIfHasNotAccess("C");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State untuk preview gambar logo yang dipilih
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Validasi form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PerguruanTinggiEditFormData>({
    resolver: zodResolver(perguruanEditTinggiSchema),
    defaultValues: {
      statusAktif: 1, // Default diset menjadi aktif
    },
  });

  // Mengirim data baru ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: PerguruanTinggiEditFormData) =>
      masterService.createPerguruanTinggi(data),
    onSuccess: (res: any) => {
      // Sesuaikan pengecekan 'success' dengan format response backend Anda
      toast.success(res?.message || "Berhasil menambahkan perguruan tinggi");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });
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

  const onSubmit = (data: PerguruanTinggiEditFormData) => {
    mutation.mutate(data);
  };

  // Bersihkan object URL preview gambar saat komponen unmount untuk menghindari memory leak
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
          { name: "Tambah Perguruan Tinggi" },
        ]}
      />
      <p className="text-xl font-semibold mt-4">Tambah Perguruan Tinggi</p>
      
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
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

              {/* ===== TAMBAHAN: DATA OPERATOR ===== */}
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

              {/* ===== TAMBAHAN: DATA VERIFIKATOR ===== */}
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
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Preview Logo"
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
                        // Update UI preview
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PerguruanTinggiCreatePage;