import { CustTextArea } from "@/components/CustTextArea";
import type { VerifikasiFormData } from "@/types/beasiswa";
import { Check, X } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";
import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

interface CardVerifikasiBeasiswaProps {
  onSubmit: () => void;
  register: UseFormRegister<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  setValue: UseFormSetValue<VerifikasiFormData>;
  reset: UseFormReset<VerifikasiFormData>;
  watch: UseFormWatch<VerifikasiFormData>;
  getValues: UseFormGetValues<VerifikasiFormData>;
  idTrxBeasiswa: number;
}

const CardVerifikasiBeasiswa: FC<CardVerifikasiBeasiswaProps> = ({
  onSubmit,
  register,
  errors,
  setValue,
  // reset,
  // watch,
  // getValues,
  idTrxBeasiswa,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  // const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ← File yang dipilih
  // const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Fungsi untuk handle upload file

  const statusOptions = [
    {
      value: 7,
      label: "Rekomendasi",
      icon: Check,
      color: "emerald",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      hoverColor: "hover:bg-emerald-100",
      activeColor: "bg-emerald-500",
    },
    // {
    //   value: 4,
    //   label: "Tidak Sesuai",
    //   icon: AlertCircle,
    //   color: "amber",
    //   bgColor: "bg-amber-50",
    //   borderColor: "border-amber-200",
    //   textColor: "text-amber-700",
    //   hoverColor: "hover:bg-amber-100",
    //   activeColor: "bg-amber-500",
    // },
    {
      value: 3,
      label: "Tidak Rekomendasi",
      icon: X,
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      hoverColor: "hover:bg-red-100",
      activeColor: "bg-red-500",
    },
  ];

  // Fungsi untuk handle pemilihan file (BELUM UPLOAD)
  // const handleFileChange = (file: File | null) => {
  //   if (!file) return;

  //   // Validasi tipe file
  //   if (file.type !== "application/pdf") {
  //     toast.error("File harus berformat PDF");
  //     return;
  //   }

  //   // Validasi ukuran file (max 5MB)
  //   const maxSize = 5 * 1024 * 1024;
  //   if (file.size > maxSize) {
  //     toast.error("Ukuran file maksimal 5MB");
  //     return;
  //   }

  //   // ✅ Simpan file di state, BELUM upload ke server
  //   setSelectedFile(file);
  //   toast.success("File siap diupload");
  // };

  // Fungsi untuk upload file ke server (dipanggil saat submit)
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    if (!idTrxBeasiswa) {
      toast.error("ID Transaksi tidak ditemukan");
      return null;
    }

    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append("id_trx_beasiswa", idTrxBeasiswa.toString());
      formData.append("file", file);
      formData.append("id_ref_dokumen", "991"); // ⚠️ Sesuaikan dengan backend
      formData.append(
        "nama_dokumen_persyaratan",
        "Surat Keputusan Lulus Administrasi",
      );

      const response = await beasiswaService.uploadPersyaratan(
        "dinas",
        formData,
      );

      // Return URL file yang sudah diupload
      return response.data?.file ?? null;
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Gagal mengunggah file");
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // const handleRemoveFile = () => {
  //   setSelectedFile(null);
  //   setUploadedFileUrl(null);
  //   setValue("fileSuratKeputusan", "");
  // };

  // Reset tagging fields ketika status berubah dan bukan Lulus Administrasi
  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setValue("selectedStatus", value);
    console.log(value);

    if (value !== 8) {
      setSelectedFile(null);
      // setUploadedFileUrl(null);
      setValue("fileSuratKeputusan", "");
      // reset({
      //   ...getValues(),
      //   catatan: watch("catatan"),
      //   selectedStatus: value,
      // });
    }
  };

  useEffect(() => {
    // Simpan fungsi upload dan file ke form value
    if (selectedFile) {
      setValue("_uploadFile", uploadFileToServer as any);
      setValue("_selectedFile", selectedFile as any);
    }
  }, [selectedFile, setValue]);

  const { data: catatanVerifikasi } = useQuery({
    queryKey: ["catatan-verifikasi", idTrxBeasiswa],
    queryFn: () => beasiswaService.getCatatanVerifikasi(idTrxBeasiswa),
    enabled: !!idTrxBeasiswa,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const catatanData = catatanVerifikasi?.data ?? null;

  return (
    <div className="sticky top-4">
      {/* Info Box */}
      {/* <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Catatan:</strong> Pastikan semua dokumen telah diperiksa
          sebelum melakukan verifikasi.
        </p>
      </div> */}

      {/* Info Box - Catatan dari Verifikator */}
      <div className="mb-4">
        {catatanData?.catatan_verifikasi_verifikator ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-700">
              Catatan dari Verifikator Pusat:
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              {catatanData.catatan_verifikasi_verifikator}
            </p>
            {catatanData.created_by && (
              <p className="text-xs text-amber-500 mt-1">
                — {catatanData.created_by}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Catatan:</strong> Pastikan semua dokumen telah diperiksa
              sebelum melakukan verifikasi.
            </p>
          </div>
        )}
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
          {/* <button
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
          </button> */}
          <button
            type="submit"
            disabled={
              !selectedStatus ||
              (selectedStatus === 15 && !selectedFile) ||
              uploadingFile
            }
            className={`
    w-full py-3 px-4 rounded-xl font-semibold text-white
    transition-all duration-200 flex items-center justify-center gap-2
    ${
      selectedStatus && (selectedStatus !== 8 || selectedFile) && !uploadingFile
        ? "bg-primary shadow-none hover:shadow-xl"
        : "bg-gray-300 cursor-not-allowed"
    }
  `}
            onClick={onSubmit}>
            {uploadingFile ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Mengupload file...
              </>
            ) : (
              "Kirim"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardVerifikasiBeasiswa;
