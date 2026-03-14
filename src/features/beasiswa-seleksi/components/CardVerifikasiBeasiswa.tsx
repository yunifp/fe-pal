import { CustTextArea } from "@/components/CustTextArea";
import { CustSelect } from "@/components/ui/CustSelect";
import type { VerifikasiFormData } from "@/types/beasiswa";
import { AlertCircle, Check, X } from "lucide-react";
import { useState, type FC, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type {
  Control,
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
  control: Control<VerifikasiFormData>;
}

const CardVerifikasiBeasiswa: FC<CardVerifikasiBeasiswaProps> = ({
  onSubmit,
  register,
  errors,
  setValue,
  reset,
  watch,
  getValues,
  control,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  // Fetch data provinsi
  const { data: responseProvinsi } = useQuery({
    queryKey: ["opsi-provinsi"],
    queryFn: () => masterService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiOptions = useMemo(() => {
    return (
      responseProvinsi?.data?.map((provinsi) => ({
        value: String(provinsi.kode_pro + "#" + provinsi.nama_wilayah),
        label: provinsi.nama_wilayah,
      })) || []
    );
  }, [responseProvinsi]);

  // Watch provinsi untuk fetch kabkot
  const selectedProvinsi = watch("kode_dinas_provinsi");
  console.log(selectedProvinsi);

  // Extract kode provinsi
  const provinsiKode = useMemo(() => {
    if (!selectedProvinsi) return null;
    return selectedProvinsi.split("#")[0];
  }, [selectedProvinsi]);

  // Fetch data kabupaten/kota berdasarkan provinsi
  const { data: responseKabKot } = useQuery({
    queryKey: ["opsi-kabkot", provinsiKode],
    queryFn: () => masterService.getKabkot(provinsiKode!!),
    enabled: !!provinsiKode,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotOptions = useMemo(() => {
    return (
      responseKabKot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseKabKot]);

  const statusOptions = [
    {
      value: 6,
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

  // Reset tagging fields ketika status berubah dan bukan Lulus Administrasi
  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setValue("selectedStatus", value);

    if (value !== 6) {
      reset({
        ...getValues(),
        catatan: watch("catatan"),
        selectedStatus: value,
        kode_dinas_provinsi: undefined,
        kode_dinas_kabkota: undefined,
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
        <div className="p-6 space-y-5">
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
          {/* Dropdown Provinsi dan Kabkot - Tampil jika Lulus Administrasi */}
          {selectedStatus === 6 && (
            <div className="space-y-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                {/* <Check className="w-5 h-5 text-emerald-600" /> */}
                <h4 className="font-semibold text-emerald-900"></h4>
              </div>

              {/* Dropdown Provinsi */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-emerald-900 block">
                  Provinsi
                  <span className="text-red-500 ml-1">*</span>
                </label> */}
                <CustSelect
                  name="kode_dinas_provinsi"
                  label="Provinsi"
                  control={control}
                  options={provinsiOptions}
                  placeholder="Pilih Provinsi"
                  error={errors.kode_dinas_provinsi}
                />
              </div>

              {/* Dropdown Kabupaten/Kota */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-emerald-900 block">
                  Kabupaten/Kota 
                  <span className="text-red-500 ml-1">*</span>
                </label> */}
                <CustSelect
                  name="kode_dinas_kabkota"
                  label="Kabupaten/Kota"
                  control={control}
                  options={kabkotOptions}
                  placeholder={
                    selectedProvinsi
                      ? "Pilih Kabupaten/Kota"
                      : "Pilih provinsi terlebih dahulu"
                  }
                  error={errors.kode_dinas_kabkota}
                  // disabled={!selectedProvinsi}
                />
                {!selectedProvinsi && (
                  <p className="text-xs text-emerald-600 bg-white/50 p-2 rounded">
                    Pilih provinsi terlebih dahulu untuk memilih kabupaten/kota
                  </p>
                )}
              </div>

              <div className="bg-white/50 p-3 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-700">
                  <strong>Catatan:</strong> Provinsi dan kabupaten/kota ini akan
                  digunakan untuk menentukan lokasi data yang lulus
                  administrasi.
                </p>
              </div>
            </div>
          )}

          {/* Catatan */}
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

          {/* Submit Button */}
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
