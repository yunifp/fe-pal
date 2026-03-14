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
  role?: "kabkota" | "provinsi";
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
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Fungsi untuk handle upload file

  const statusOptions = [
    {
      value: 9,
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
      value: 8,
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
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validasi tipe file
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    // ✅ Simpan file di state, BELUM upload ke server
    setSelectedFile(file);
    toast.success("File siap diupload");
  };

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
      formData.append("id_ref_dokumen", "999");
      formData.append(
        "nama_dokumen_persyaratan",
        "Surat Keputusan Lulus Administrasi Provinsi",
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setValue("fileSuratKeputusan", "");
  };

  // Reset tagging fields ketika status berubah dan bukan Lulus Administrasi
  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setValue("selectedStatus", value);

    if (value !== 15) {
      setSelectedFile(null);
      setUploadedFileUrl(null);
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
      <div className="mb-4">
        {catatanData?.catatan_verifikasi_verifikator ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-700">
              Catatan dari Verifikator Kabupaten Kota:
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              {catatanData.catatan_verifikasi_dinas_kabkota}
            </p>
            {catatanData.created_by && (
              <p className="text-xs text-amber-500 mt-1">
                — {catatanData.catatan_by_dinas_kabkota}
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

          {selectedStatus === 15 && (
            <div className="space-y-2 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <label className="text-sm font-medium text-emerald-900 block">
                Upload Surat Keputusan Lulus
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="space-y-3">
                {/* ====== AREA UPLOAD ====== */}
                {!selectedFile && (
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white">
                    <input
                      type="file"
                      id="file-upload-surat-keputusan"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        handleFileChange(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                    <label
                      htmlFor="file-upload-surat-keputusan"
                      className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-700">
                          Klik untuk pilih file
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          PDF (Max. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* ====== DISPLAY FILE YANG DIPILIH (BELUM DIUPLOAD) ====== */}
                {selectedFile && !uploadedFileUrl && (
                  <div className="flex items-center gap-3 p-4 bg-white border-2 border-emerald-300 rounded-lg">
                    {/* Icon File */}
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    {/* Nama File */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Siap diupload (
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Hapus file">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* ====== DISPLAY FILE YANG SUDAH DIUPLOAD (SETELAH SUBMIT) ====== */}
                {uploadedFileUrl && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-100 border-2 border-emerald-400 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-700"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-900">
                        File berhasil diupload
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {selectedFile?.name}
                      </p>
                    </div>
                    <a
                      href={uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Lihat file">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                <p className="text-xs text-emerald-700 bg-white/50 p-2 rounded border border-emerald-200">
                  <strong>Catatan:</strong> File akan diupload saat Anda menekan
                  tombol "Kirim Verifikasi"
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
      selectedStatus &&
      (selectedStatus !== 15 || selectedFile) &&
      !uploadingFile
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
