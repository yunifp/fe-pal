import { CustTextArea } from "@/components/CustTextArea";
import { beasiswaService } from "@/services/beasiswaService";
import {
  verifikasiDinasSchema,
  type VerifikasiDinasFormData,
} from "@/types/beasiswa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check } from "lucide-react";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CardVerifikasiBeasiswaProps {
  idTrxBeasiswa: number;
}

const CardVerifikasiBeasiswa: FC<CardVerifikasiBeasiswaProps> = ({
  idTrxBeasiswa,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<VerifikasiDinasFormData>({
    resolver: zodResolver(verifikasiDinasSchema),
    defaultValues: {
      catatan: "",
      selectedStatus: undefined,
    },
  });

  const statusOptions = [
    {
      value: 72,
      label: "Lulus",
      icon: Check,
      color: "emerald",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      hoverColor: "hover:bg-emerald-100",
      activeColor: "bg-emerald-500",
    },
    {
      value: 9,
      label: "Kembalikan untuk Diperbaiki",
      icon: AlertCircle,
      color: "amber",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      hoverColor: "hover:bg-amber-100",
      activeColor: "bg-amber-500",
    },
  ];

  const mutation = useMutation({
    mutationFn: async (data: VerifikasiDinasFormData) => {
      return beasiswaService.updateFlowBeasiswa(
        idTrxBeasiswa,
        selectedStatus!,
        data.catatan || "",
        data,
        "dinas",
      );
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        navigate("/beasiswa_verifikasi_dinas");
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

  const onSubmit = (data: VerifikasiDinasFormData) => {
    if (!selectedStatus) {
      toast.error("Silakan pilih status verifikasi");
      return;
    }

    // Hapus selectedStatus sebelum kirim ke backend
    const { selectedStatus: _, ...submitData } = data;
    mutation.mutate(submitData);
  };

  // Reset tagging fields ketika status berubah dan bukan Lulus Administrasi
  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setValue("selectedStatus", value);

    if (value !== 7) {
      reset({
        catatan: watch("catatan"),
        selectedStatus: value,
      });
    }
  };

  return (
    <div className="sticky top-4">
      {/* Info Box */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Catatan:</strong> Pastikan semua dokumen telah diperiksa
          sebelum melakukan verifikasi.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-none border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Panel Keputusan</h3>
          <p className="text-blue-100 text-sm mt-1">
            Pilih status dan berikan catatan
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Status Options */}
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
                  `}
                >
                  <div
                    className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? "bg-white/20" : "bg-white"}
                  `}
                  >
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
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Catatan Verifikasi
              {selectedStatus === 9 ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                <span className="text-gray-400 text-xs ml-1">(opsional)</span>
              )}
            </label>
            <CustTextArea
              id="catatan"
              placeholder={
                selectedStatus === 9
                  ? "Jelaskan dokumen apa yang perlu diperbaiki..."
                  : "Tulis catatan verifikasi (opsional)..."
              }
              {...register("catatan")}
              error={!!errors.catatan}
              errorMessage={errors.catatan?.message}
              rows={5}
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedStatus || mutation.isPending}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${
                selectedStatus && !mutation.isPending
                  ? "bg-primary shadow-none hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              "Simpan Verifikasi"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardVerifikasiBeasiswa;
