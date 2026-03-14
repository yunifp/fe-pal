import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IPersyaratanKhususBeasiswa } from "@/types/beasiswa";
import { beasiswaService } from "@/services/beasiswaService";
import { isValidByDocType, parseValidTypes } from "@/utils/fileFormatter";
import { validTypeToAccept } from "@/utils/stringFormatter";

interface UploadPersyaratanKhususProps {
  idTrxBeasiswa: number;
  persyaratanKhusus: IPersyaratanKhususBeasiswa[];
}

const UploadPersyaratanKhusus = ({
  idTrxBeasiswa,
  persyaratanKhusus,
}: UploadPersyaratanKhususProps) => {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>(
    {},
  );
  // ✅ State baru untuk menyimpan catatan per dokumen
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

  // 🧠 Ambil data file yang sudah pernah diunggah
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const res = await beasiswaService.getUploadedPersyaratan(
          "khusus",
          idTrxBeasiswa,
        );
        const uploaded = res.data ?? [];

        const fileMap: Record<number, string> = {};
        const catatanMapTemp: Record<number, string> = {};

        uploaded.forEach((item: any) => {
          fileMap[item.id_ref_dokumen] = item.file;
          // ✅ Simpan catatan jika ada
          if (item.verifikator_catatan) {
            catatanMapTemp[item.id_ref_dokumen] = item.verifikator_catatan;
          }
        });

        setUploadedFiles(fileMap);
        setCatatanMap(catatanMapTemp);
      } catch (error) {
        toast.error("Gagal memuat data persyaratan yang sudah diunggah");
      }
    };

    fetchUploadedFiles();
  }, [idTrxBeasiswa]);

  // ketika user memilih file
  const handleFileChange = async (
    item: IPersyaratanKhususBeasiswa,
    file: File | null,
  ) => {
    if (!file) return;

    const allowedTypes = parseValidTypes(item.valid_type);

    if (!isValidByDocType(file, item.valid_type)) {
      toast.error(`File tidak valid. Gunakan: ${allowedTypes.join(", ")}`);
      return;
    }

    try {
      setUploadingId(item.id);

      const formData = new FormData();
      formData.append("id_trx_beasiswa", idTrxBeasiswa.toString());
      formData.append("file", file);
      formData.append("id_ref_dokumen", item.id.toString());
      formData.append("nama_dokumen_persyaratan", item.persyaratan);

      const response = await beasiswaService.uploadPersyaratan(
        "khusus",
        formData,
      );

      toast.success("File berhasil diunggah");

      setUploadedFiles((prev) => ({
        ...prev,
        [item.id]: response.data?.file ?? "",
      }));

      setCatatanMap((prev) => {
        const newMap = { ...prev };
        delete newMap[item.id];
        return newMap;
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Gagal upload");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {persyaratanKhusus.map((item) => {
        const isUploaded = !!uploadedFiles[item.id];
        const isUploading = uploadingId === item.id;
        const fileName = uploadedFiles[item.id];
        const catatan = catatanMap[item.id]; // ✅ Ambil catatan
        const hasCatatan = !!catatan;
        const isRequired = item.is_required === "Y";

        return (
          <div
            key={item.id}
            className={`
            relative border-2 rounded-xl p-5 transition-all duration-200
            ${
              hasCatatan
                ? "border-amber-300 bg-amber-50/50"
                : isUploaded
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-200 bg-white hover:border-gray-300"
            }
          `}>
            {/* Status Badge */}
            {isUploaded && !hasCatatan && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Terunggah
                </span>
              </div>
            )}
            {/* ✅ Badge untuk dokumen dengan catatan */}
            {hasCatatan && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Perlu Perbaikan
                </span>
              </div>
            )}

            {/* Label */}
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              {item.persyaratan}
              {isRequired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  Wajib
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                  Opsional
                </span>
              )}
            </label>
            {/* ✅ Tampilkan Catatan Verifikator */}
            {hasCatatan && (
              <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-800 mb-1">
                      Catatan dari Verifikator:
                    </p>
                    <p className="text-sm text-amber-900">{catatan}</p>
                  </div>
                </div>
              </div>
            )}
            {isUploading && (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Mengunggah...
              </span>
            )}
            {!isUploading && (
              <div className="flex items-center gap-3">
                {/* File Input Area */}
                <div className="flex-1">
                  <label
                    htmlFor={`persyaratan-${item.id}`}
                    className={`
                      flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg
                      cursor-pointer transition-all duration-200
                      ${
                        hasCatatan
                          ? "border-amber-400 bg-white hover:bg-amber-50"
                          : isUploaded
                            ? "border-green-300 bg-white hover:bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                      }
                    `}>
                    <input
                      id={`persyaratan-${item.id}`}
                      type="file"
                      className="hidden"
                      accept={parseValidTypes(item.valid_type)
                        .map((t) => `.${t}`)
                        .join(",")}
                      onChange={(e) => {
                        handleFileChange(item, e.target.files?.[0] ?? null);
                        e.target.value = ""; // supaya bisa upload file yang sama lagi
                      }}
                      disabled={isUploading}
                    />

                    {/* Icon */}
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                        ${
                          hasCatatan
                            ? "bg-amber-100"
                            : isUploaded
                              ? "bg-green-100"
                              : "bg-gray-200"
                        }
                      `}>
                      {hasCatatan ? (
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      ) : isUploaded ? (
                        <svg
                          className="w-5 h-5 text-green-600"
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
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-500"
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
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      {hasCatatan ? (
                        <>
                          <p className="text-sm font-medium text-amber-700">
                            Unggah ulang file yang sudah diperbaiki
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Pastikan sesuai dengan catatan verifikator
                          </p>
                        </>
                      ) : isUploaded ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Klik untuk mengganti file
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Pilih file
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Ekstensi yang diterima:{" "}
                            {validTypeToAccept(item.valid_type)}. Maksimal 10MB
                          </p>
                          <p className="text-[11px] text-red-500 mt-1">
                            File akan otomatis diunggah setelah dipilih
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                {isUploaded && (
                  <a
                    href={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center justify-center
                      w-10 h-10 rounded-lg
                      bg-blue-50 text-blue-600
                      hover:bg-blue-100 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                    title="Unduh file">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UploadPersyaratanKhusus;
