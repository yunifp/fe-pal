/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, FileCheck } from "lucide-react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CustTextArea } from "@/components/CustTextArea";
import type { VerifikasiFormData } from "@/types/beasiswa";

interface KesesuaianSectionProps {
  title: string;
  nameValid: keyof VerifikasiFormData;
  nameCatatan: keyof VerifikasiFormData;
  textareaPlaceholder?: string;
  sectionCatatan?: {
    isValid?: "Y" | "N" | null;
    catatan?: string | null;
  };
  register: UseFormRegister<VerifikasiFormData>;
  control: Control<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  revisedAt?: string | null;
  onAutosave?: (value: "Y" | "N", catatan?: string) => void;
}

export const KesesuaianSection = ({
  title,
  nameValid,
  nameCatatan,
  textareaPlaceholder,
  register,
  control,
  errors,
  sectionCatatan,
  revisedAt,
  onAutosave,
}: KesesuaianSectionProps) => {
  const { setValue, getValues } = useFormContext<VerifikasiFormData>();

  useEffect(() => {
    if (sectionCatatan?.isValid === "Y") {
      setValue(nameValid as any, "Y");
    } else if (sectionCatatan?.isValid === "N") {
      setValue(nameValid as any, "N");
      if (sectionCatatan.catatan) {
        setValue(nameCatatan as any, sectionCatatan.catatan);
      }
    }
  }, [
    sectionCatatan?.isValid,
    sectionCatatan?.catatan,
    nameValid,
    nameCatatan,
    setValue,
  ]);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <Controller
        name={nameValid}
        control={control}
        render={({ field }) => {
          const value = field.value as "Y" | "N" | undefined;

          const containerClass =
            value === "Y"
              ? "bg-green-50 border-green-200"
              : value === "N"
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-gray-200";

          const iconColor =
            value === "Y"
              ? "text-green-600"
              : value === "N"
                ? "text-amber-600"
                : "text-gray-600";

          return (
            <div className="space-y-3">
              {revisedAt ? (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-400 rounded-r-lg p-3 text-sm text-blue-800">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div className="w-full">
                    <p className="font-medium text-blue-900 text-xs mb-0.5">
                      Diperbaiki oleh peserta
                    </p>
                    <p>
                      Data pada section ini sudah diperbaiki — periksa perubahan
                      sebelum memverifikasi.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Diperbaiki pada:{" "}
                      {new Date(revisedAt).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                sectionCatatan?.isValid === "N" &&
                sectionCatatan.catatan && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <p className="font-medium mb-1">
                      Catatan Verifikasi Sebelumnya:
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {sectionCatatan.catatan}
                    </p>
                  </div>
                )
              )}

              {sectionCatatan?.isValid === "Y" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="font-medium">
                    Sebelumnya dinyatakan sesuai oleh selektor
                  </p>
                </div>
              )}

              <div
                className={`border rounded-lg p-4 space-y-4 transition-colors ${containerClass}`}>
                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${iconColor}`} />
                    {title}
                  </span>
                  {revisedAt && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 flex-shrink-0">
                      <FileCheck className="w-3 h-3" />
                      Diperbaiki peserta
                    </span>
                  )}
                </label>

                <RadioGroup
                  value={field.value?.toString() ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // ✅ Saat "Y" kirim catatan kosong, saat "N" ambil catatan existing
                    const catatan =
                      val === "Y"
                        ? ""
                        : (getValues(nameCatatan as any) as string | undefined);
                    onAutosave?.(val as "Y" | "N", catatan);
                  }}
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

                {errors[nameValid] && (
                  <p className="text-xs text-red-500">
                    {errors[nameValid]?.message as string}
                  </p>
                )}

                {value === "N" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Catatan Perbaikan
                    </label>
                    <CustTextArea
                      placeholder={
                        textareaPlaceholder ??
                        "Isi catatan perbaikan jika data tidak sesuai"
                      }
                      error={!!errors[nameCatatan]}
                      errorMessage={errors[nameCatatan]?.message as string}
                      {...register(nameCatatan, {
                        onBlur: (e) => {
                          // ✅ Simpan catatan saat user selesai mengetik
                          onAutosave?.("N", e.target.value);
                        },
                      })}
                    />
                  </div>
                )}

                {value === "Y" && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Data telah diseleksi dan sesuai
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
