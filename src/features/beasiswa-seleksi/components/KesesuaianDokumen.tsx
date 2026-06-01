/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Download } from "lucide-react";
import {
  Controller,
  useFormContext,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import type {
  ITrxDokumenKhusus,
  ITrxDokumenUmum,
  VerifikasiFormData,
} from "@/types/beasiswa";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { downloadSecureFile } from "@/utils/fileHelper";
import { toast } from "sonner";

interface KesesuaianDokumenProps {
  dokumen: ITrxDokumenKhusus | ITrxDokumenUmum;
  index: number;
  fieldName: "data_persyaratan_umum" | "data_persyaratan_khusus";
  control: Control<VerifikasiFormData>;
  register: UseFormRegister<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  revisedAt?: string | null;
  isRequired?: boolean;
}

export const KesesuaianDokumen = ({
  dokumen,
  index,
  control,
  fieldName,
  register,
  errors,
  revisedAt,
  isRequired = true,
}: KesesuaianDokumenProps) => {
  const nameValid = `${fieldName}.${index}.is_valid` as const;
  const nameCatatan = `${fieldName}.${index}.catatan` as const;
  const errorRadio = errors[fieldName]?.[index]?.is_valid;

  const [isDownloading, setIsDownloading] = useState(false);

  // Ambil setValue dari FormProvider context
  const { setValue } = useFormContext<VerifikasiFormData>();

  // Pre-populate nilai radio & catatan berdasarkan status_verifikasi yang sudah ada di DB
  useEffect(() => {
    setValue(`${fieldName}.${index}.id` as const, String(dokumen.id));
    setValue(
      `${fieldName}.${index}.is_required` as const,
      isRequired ? "Y" : "N",
    );

    const statusVerifikasi = (dokumen as any).status_verifikasi as
      | "sesuai"
      | "tidak sesuai"
      | null
      | undefined;

    if (statusVerifikasi === "sesuai") {
      setValue(nameValid, "Y");
    } else if (statusVerifikasi === "tidak sesuai") {
      setValue(nameValid, "N");
      // Pre-populate catatan verifikator jika ada
      if (dokumen.verifikator_catatan) {
        setValue(nameCatatan, dokumen.verifikator_catatan);
      }
    }
  }, [
    dokumen.id,
    isRequired,
    (dokumen as any).status_verifikasi,
    dokumen.verifikator_catatan,
    nameValid,
    nameCatatan,
    setValue,
  ]);

  // ✅ Fungsi khusus untuk handle download dengan ekstensi yang akurat
  const handleDownload = async () => {
    if (!dokumen.file) return;

    setIsDownloading(true);
    try {
      let fileName = `Dokumen_${index + 1}.pdf`;

      if (dokumen.nama_dokumen_persyaratan) {
        let ext = ".pdf";

        try {
          // Parsing URL untuk mengambil parameter "file" yang bersih dari &t=
          const urlObj = new URL(dokumen.file, window.location.origin);
          const fileParam = urlObj.searchParams.get("file");

          if (fileParam) {
            const actualFile = fileParam.split("/").pop() || "";
            // Ambil ekstensi asli (misal .png, .jpg, .pdf)
            ext = actualFile.includes(".")
              ? actualFile.substring(actualFile.lastIndexOf("."))
              : ".pdf";
          }
        } catch (e) {
          // Fallback jika URL gagal di-parsing
        }

        // Ganti spasi/karakter aneh di nama dokumen dengan underscore
        const cleanName = dokumen.nama_dokumen_persyaratan.replace(
          /[^a-zA-Z0-9 -]/g,
          "_",
        );
        fileName = `${cleanName}${ext}`;
      }

      await downloadSecureFile(dokumen.file, fileName);
    } catch (error) {
      toast.error("Gagal mengunduh file. Sesi Anda mungkin sudah berakhir.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Controller
      control={control}
      name={nameValid}
      render={({ field }) => {
        const status = field.value; // "Y" | "N" | undefined

        const bgClass =
          status === "Y"
            ? "bg-green-50 border-green-200"
            : status === "N"
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-gray-200";

        return (
          <div
            className={`border rounded-lg p-4 space-y-3 transition-all ${bgClass}`}>
            {/* Hidden fields untuk id dan kategori */}
            <input
              type="hidden"
              {...register(`${fieldName}.${index}.id` as const)}
              value={dokumen.id}
            />
            <input
              type="hidden"
              {...register(`${fieldName}.${index}.kategori` as const)}
              value={fieldName === "data_persyaratan_umum" ? "Umum" : "Khusus"}
            />
            <input
              type="hidden"
              {...register(`${fieldName}.${index}.is_required` as const)}
              value={isRequired ? "Y" : "N"}
            />
            {/* Banner biru dokumen diupload ulang */}
            {revisedAt && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-400 rounded-r-lg p-3 mb-2 text-sm text-blue-800">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                <div className="w-full">
                  <p className="font-medium text-blue-900 text-xs mb-0.5">
                    Dokumen diupload ulang oleh peserta
                  </p>
                  <p>
                    Peserta telah mengupload ulang dokumen ini — periksa file
                    terbaru sebelum memverifikasi.
                  </p>

                  {/* Catatan verifikasi sebelumnya */}
                  {dokumen.verifikator_catatan && (
                    <div className="mt-2 bg-white/60 border border-blue-200 rounded-md p-2">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Catatan verifikasi sebelumnya:
                      </p>
                      <p className="text-xs text-blue-800 whitespace-pre-wrap leading-relaxed">
                        {dokumen.verifikator_catatan}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-blue-600 mt-2">
                    Diupload ulang:{" "}
                    {new Date(revisedAt).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {dokumen.nama_dokumen_persyaratan || `Dokumen ${index + 1}`}
                </p>

                {dokumen.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Upload:{" "}
                    {new Date(dokumen.timestamp).toLocaleString("id-ID")}
                  </p>
                )}

                {/* Tampilkan info sudah pernah diverifikasi */}
                {(dokumen as any).status_verifikasi && (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 font-medium ${
                      (dokumen as any).status_verifikasi === "sesuai"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}>
                    {(dokumen as any).status_verifikasi === "sesuai" ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Pernah diseleksi: Sesuai
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pernah diseleksi: Perlu Diperbaiki
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* ✅ Ganti tag a dengan Button onClick dan handleDownload */}
              {dokumen.file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  type="button">
                  {isDownloading ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  {isDownloading ? "Mengunduh..." : "Lihat File"}
                </Button>
              )}
            </div>

            <Separator />

            {/* Radio tetap bisa diubah oleh verifikator */}
            <RadioGroup
              value={field.value?.toString() ?? ""}
              onValueChange={field.onChange}
              className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Y" id={`${nameValid}-Y`} />
                <Label htmlFor={`${nameValid}-Y`}>Sesuai</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="N" id={`${nameValid}-N`} />
                <Label htmlFor={`${nameValid}-N`}>Perlu Diperbaiki</Label>
              </div>
            </RadioGroup>

            {errorRadio && (
              <p className="text-xs text-red-500">{errorRadio.message}</p>
            )}

            {/* CATATAN — tampil jika N */}
            {status === "N" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Catatan Perbaikan
                </label>
                <CustTextArea
                  error={!!errors?.[fieldName]?.[index]?.catatan}
                  errorMessage={errors?.[fieldName]?.[index]?.catatan?.message}
                  {...register(nameCatatan)}
                />
              </div>
            )}

            {/* INFO SESUAI */}
            {status === "Y" && (
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Dokumen telah diseleksi dan sesuai
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
