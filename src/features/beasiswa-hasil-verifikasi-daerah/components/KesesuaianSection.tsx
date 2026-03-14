import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Controller,
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
}: KesesuaianSectionProps) => {
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
              {sectionCatatan?.isValid === "N" && sectionCatatan.catatan && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <p className="font-medium mb-1">Catatan Sebelumnya :</p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {sectionCatatan.catatan}
                  </p>
                </div>
              )}

              <div
                className={`border rounded-lg p-4 space-y-4 transition-colors ${containerClass}`}>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${iconColor}`} />
                  {title}
                </label>

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

                {/* error radio */}
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
                      {...register(nameCatatan)}
                    />
                  </div>
                )}

                {/* INFO SESUAI */}
                {value === "Y" && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Data telah diverifikasi dan sesuai
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
