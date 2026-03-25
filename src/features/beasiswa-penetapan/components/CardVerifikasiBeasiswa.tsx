import { CustTextArea } from "@/components/CustTextArea";
import type { VerifikasiFormData } from "@/types/beasiswa";
import { AlertCircle, Check, X } from "lucide-react";
import { useState, type FC } from "react";
import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface CardVerifikasiBeasiswaProps {
  onSubmit: () => void;
  register: UseFormRegister<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  setValue: UseFormSetValue<VerifikasiFormData>;
  reset: UseFormReset<VerifikasiFormData>;
  watch: UseFormWatch<VerifikasiFormData>;
  getValues: UseFormGetValues<VerifikasiFormData>;
}

const CardVerifikasiBeasiswa: FC<CardVerifikasiBeasiswaProps> = ({
  onSubmit,
  register,
  errors,
  setValue,
  reset,
  watch,
  getValues,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const statusOptions = [
    {
      value: 13,
      label: "Lulus Administrasi",
      icon: Check,
      color: "emerald",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      hoverColor: "hover:bg-emerald-100",
      activeColor: "bg-emerald-500",
    },
    {
      value: 4,
      label: "Kembalikan untuk Diperbaiki",
      icon: AlertCircle,
      color: "amber",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      hoverColor: "hover:bg-amber-100",
      activeColor: "bg-amber-500",
    },
    {
      value: 3,
      label: "Tolak",
      icon: X,
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      hoverColor: "hover:bg-red-100",
      activeColor: "bg-red-500",
    },
  ];

  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setValue("selectedStatus", value);

    if (value !== 1000) {
      reset({
        ...getValues(),
        catatan: watch("catatan"),
        selectedStatus: value,
        kode_dinas_provinsi: "",
        kode_dinas_kabkota: "",
      });
    }
  };

  return (
    <div className="sticky top-4">
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Catatan:</strong> Pastikan semua dokumen telah diperiksa
          sebelum melakukan verifikasi.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-none border border-gray-200 overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Panel Keputusan</h3>
          <p className="text-blue-100 text-sm mt-1">
            Pilih status dan berikan catatan
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Status Verifikasi
            </label>
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 
                    transition-all duration-200 text-left
                    ${
                      isSelected
                        ? `${option.activeColor} border-transparent shadow-md scale-[1.02]`
                        : `${option.bgColor} ${option.borderColor} ${option.hoverColor}`
                    }
                  `}>
                  <div
                    className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? "bg-white/20" : "bg-white"}
                  `}>
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? "text-white" : option.textColor
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-white" : option.textColor
                    }`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Catatan Verifikasi
              {selectedStatus === 4 || selectedStatus === 3 ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                <span className="text-gray-400 text-xs ml-1">(opsional)</span>
              )}
            </label>
            <CustTextArea
              id="catatan"
              placeholder={
                selectedStatus === 4
                  ? "Jelaskan dokumen apa yang perlu diperbaiki..."
                  : selectedStatus === 3
                    ? "Jelaskan alasan penolakan..."
                    : "Tulis catatan verifikasi (opsional)..."
              }
              {...register("catatan")}
              error={!!errors.catatan}
              errorMessage={errors.catatan?.message}
              rows={5}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedStatus}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${
                selectedStatus
                  ? "bg-primary shadow-none hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
            onClick={onSubmit}>
            Kirim{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardVerifikasiBeasiswa;