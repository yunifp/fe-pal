/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Download, ExternalLink } from "lucide-react";
import {
  Controller,
  useFormContext,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
// import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import type {
  ITrxDokumenKhusus,
  ITrxDokumenUmum,
  VerifikasiFormData,
} from "@/types/beasiswa";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ✅ Tambahkan import helper downloadSecureFile dan toast
import { downloadSecureFile } from "@/utils/fileHelper";
import { toast } from "sonner";

interface KesesuaianDokumenProps {
  dokumen: ITrxDokumenKhusus | ITrxDokumenUmum;
  index: number;
  fieldName: "data_persyaratan_umum" | "data_persyaratan_khusus";
  control: Control<VerifikasiFormData>;
  register: UseFormRegister<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  verifikatorMode?: "ditjenbun" | "dinas";
  isReadOnly?: boolean;
}

export const KesesuaianDokumen = ({
  dokumen,
  index,
  control,
  fieldName,
  register,
  errors,
  verifikatorMode = "ditjenbun",
  isReadOnly = false,
}: KesesuaianDokumenProps) => {
  const nameValid = `${fieldName}.${index}.is_valid` as const;
  const nameCatatan = `${fieldName}.${index}.catatan` as const;
  const errorRadio = errors[fieldName]?.[index]?.is_valid;

  const [isDownloading, setIsDownloading] = useState(false);

  const { setValue } = useFormContext<VerifikasiFormData>();

  // ✅ Tentukan sumber data pre-populate berdasarkan verifikatorMode
  const doc = dokumen as any;

  const existingIsValid: "Y" | "N" | null =
    verifikatorMode === "dinas"
      ? (doc.verifikator_dinas_is_valid ?? null) // kolom baru: langsung "Y"/"N"
      : doc.verifikator_dinas_is_valid === "sesuai"
        ? "Y"
        : doc.verifikator_dinas_is_valid === "tidak sesuai"
          ? "N"
          : null; // kolom existing: enum "sesuai"/"tidak sesuai"

  const existingCatatan: string | null =
    verifikatorMode === "dinas"
      ? (doc.verifikator_dinas_catatan ?? null)
      : (doc.verifikator_catatan ?? null);

  const existingNama: string | null =
    verifikatorMode === "dinas"
      ? (doc.verifikator_dinas_nama ?? null)
      : (doc.verifikator_nama ?? null);

  const existingTimestamp: string | null =
    verifikatorMode === "dinas"
      ? (doc.verifikator_dinas_timestamp ?? null)
      : (doc.verifikator_timestamp ?? null);

  // ✅ Auto pre-populate radio & catatan
  useEffect(() => {
    if (existingIsValid === "Y") {
      setValue(nameValid, "Y");
    } else if (existingIsValid === "N") {
      setValue(nameValid, "N");
      if (existingCatatan) {
        setValue(nameCatatan, existingCatatan);
      }
    }
  }, [existingIsValid, existingCatatan, nameValid, nameCatatan, setValue]);

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
            const actualFile = fileParam.split('/').pop() || "";
            // Ambil ekstensi asli (misal .png, .jpg, .pdf)
            ext = actualFile.includes('.') ? actualFile.substring(actualFile.lastIndexOf('.')) : '.pdf';
          }
        } catch (e) {
          // Fallback jika URL gagal di-parsing
        }

        // Ganti spasi/karakter aneh di nama dokumen dengan underscore
        const cleanName = dokumen.nama_dokumen_persyaratan.replace(/[^a-zA-Z0-9 \-]/g, "_");
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
        const status = field.value;

        const bgClass =
          status === "Y"
            ? "bg-green-50 border-green-200"
            : status === "N"
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-gray-200";

        return (
          <div
            className={`border rounded-lg p-4 space-y-3 transition-all ${bgClass}`}>
            {/* Hidden fields */}
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

                {/* ✅ Badge riwayat verifikasi */}
                {existingIsValid && (
                  <p
                    className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
                      existingIsValid === "Y"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}>
                    {existingIsValid === "Y" ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Pernah diverifikasi: Sesuai
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pernah diverifikasi: Tidak Sesuai
                      </>
                    )}
                    {existingNama && ` — ${existingNama}`}
                    {existingTimestamp &&
                      ` (${new Date(existingTimestamp).toLocaleDateString("id-ID")})`}
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
                  type="button"
                >
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

            {/* Radio */}
            <RadioGroup
              value={field.value?.toString() ?? ""}
              onValueChange={field.onChange}
              className="flex gap-6"
              disabled={isReadOnly}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Y"
                  id={`${nameValid}-Y`}
                  disabled={isReadOnly}
                />
                <Label
                  htmlFor={`${nameValid}-Y`}
                  className={isReadOnly ? "opacity-50 cursor-not-allowed" : ""}>
                  Sesuai
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="N"
                  id={`${nameValid}-N`}
                  disabled={isReadOnly}
                />
                <Label
                  htmlFor={`${nameValid}-N`}
                  className={isReadOnly ? "opacity-50 cursor-not-allowed" : ""}>
                  Tidak Sesuai
                </Label>
              </div>
            </RadioGroup>

            {errorRadio && (
              <p className="text-xs text-red-500">{errorRadio.message}</p>
            )}

            {/* Catatan jika N */}
            {/* {status === "N" && (
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
            )} */}

            {/* Info sesuai */}
            {status === "Y" && (
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Dokumen telah diverifikasi dan sesuai
              </div>
            )}
          </div>
        );
      }}
    />
  );
};