/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import type { IPersyaratanKhususBeasiswa } from "@/types/beasiswa";
import { beasiswaService } from "@/services/beasiswaService";
import { isValidByDocType, parseValidTypes } from "@/utils/fileFormatter";
import { validTypeToAccept } from "@/utils/stringFormatter";
import { compressIfImage, parseSizeToBytes } from "@/utils/fileCompressor";

type ExtendedPersyaratan = IPersyaratanKhususBeasiswa & { size?: string };

interface UploadPersyaratanKhususProps {
  idTrxBeasiswa: number;
  persyaratanKhusus: ExtendedPersyaratan[];
}

export interface UploadPersyaratanKhususRef {
  uploadAllPending: () => Promise<void>;
  hasPendingFiles: () => boolean;
  resetAll: () => void;
}

const UploadPersyaratanKhusus = forwardRef<
  UploadPersyaratanKhususRef,
  UploadPersyaratanKhususProps
>(({ idTrxBeasiswa, persyaratanKhusus }, ref) => {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>({});
  const [compressingId, setCompressingId] = useState<number | null>(null);
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [skipNextFetch, setSkipNextFetch] = useState(false);

  const uploadAllPending = async () => {
    for (const [idStr, file] of Object.entries(pendingFiles)) {
      const id = Number(idStr);
      const item = persyaratanKhusus.find((p) => p.id === id);
      if (!item) continue;

      try {
        setUploadingId(id);
        const formData = new FormData();
        formData.append("id_trx_beasiswa", idTrxBeasiswa.toString());
        formData.append("file", file);
        formData.append("id_ref_dokumen", id.toString());
        formData.append("nama_dokumen_persyaratan", item.persyaratan);
        formData.append("max_size", item.size ?? "2 mb");

        const response = await beasiswaService.uploadPersyaratan(
          "khusus",
          formData,
        );

        setUploadedFiles((prev) => ({
          ...prev,
          [id]: response.data?.file ?? "",
        }));
        setPendingFiles((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (error: any) {
        toast.error(
          `Gagal upload ${item.persyaratan}: ${error.response?.data?.message ?? "Error"}`,
        );
        throw error;
      } finally {
        setUploadingId(null);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    uploadAllPending,
    hasPendingFiles: () => Object.keys(pendingFiles).length > 0,
    resetAll: () => {
      setSkipNextFetch(true);
      setPendingFiles({});
      setUploadedFiles({});
      setCatatanMap({});
    },
  }));

  useEffect(() => {
    if (skipNextFetch) {
      setSkipNextFetch(false);
      return;
    }
    const fetchUploadedFiles = async () => {
      setUploadedFiles({});
      setCatatanMap({});

      if (persyaratanKhusus.length === 0) return;
      try {
        const res = await beasiswaService.getUploadedPersyaratan(
          "khusus",
          idTrxBeasiswa,
        );
        const uploaded = res.data ?? [];

        const relevantIds = new Set(persyaratanKhusus.map((p) => p.id));

        const fileMap: Record<number, string> = {};
        const catatanMapTemp: Record<number, string> = {};

        uploaded.forEach((item: any) => {
          if (!relevantIds.has(item.id_ref_dokumen)) return;
          fileMap[item.id_ref_dokumen] = item.file;
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
  }, [idTrxBeasiswa, persyaratanKhusus]);

  const handleFileChange = async (
    item: ExtendedPersyaratan,
    file: File | null,
  ) => {
    if (!file) return;

    if (!isValidByDocType(file, item.valid_type)) {
      const allowedTypes = parseValidTypes(item.valid_type);
      toast.error(`File tidak valid. Gunakan: ${allowedTypes.join(", ")}`);
      return;
    }

    try {
      setCompressingId(item.id);

      const processedFile = await compressIfImage(file, item.size);

      const maxSizeBytes = parseSizeToBytes(item.size);

      if (processedFile.size > maxSizeBytes) {
        toast.error(
          `Ukuran file terlalu besar! Maksimal ${item.size || "2 MB"}. Silakan kompres file Anda terlebih dahulu.`
        );
        return;
      }

      setPendingFiles((prev) => ({ ...prev, [item.id]: processedFile }));

      setCatatanMap((prev) => {
        const newMap = { ...prev };
        delete newMap[item.id];
        return newMap;
      });

      toast.info(`File "${processedFile.name}" dipilih. Akan diunggah saat submit.`);
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses file");
    } finally {
      setCompressingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {persyaratanKhusus.map((item) => {
        const isUploaded = !!uploadedFiles[item.id];
        const isUploading = uploadingId === item.id;
        const fileName = uploadedFiles[item.id];
        const catatan = catatanMap[item.id];
        const hasCatatan = !!catatan;
        const isRequired = item.is_required === "Y";

        const isPending = !!pendingFiles[item.id];
        const pendingFileName = pendingFiles[item.id]?.name;

        return (
          <div
            key={item.id}
            className={`relative border-2 rounded-xl p-5 transition-all duration-200 ${
              hasCatatan
                ? "border-amber-300 bg-amber-50/50"
                : isPending
                  ? "border-blue-300 bg-blue-50/50"
                  : isUploaded
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-200 bg-white hover:border-gray-300"
            }`}>
            {isPending && !hasCatatan && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Menunggu Upload
                </span>
              </div>
            )}

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

            {(isUploading || compressingId === item.id) && (
              <span className="flex items-center gap-2 mb-3 text-sm text-blue-600 font-medium">
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
                {compressingId === item.id ? "Memproses file..." : "Mengunggah..."}
              </span>
            )}

            {!isUploading && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label
                    htmlFor={`persyaratan-${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                      hasCatatan
                        ? "border-amber-400 bg-white hover:bg-amber-50"
                        : isPending
                          ? "border-blue-400 bg-white hover:bg-blue-50"
                          : isUploaded
                            ? "border-green-300 bg-white hover:bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                    }`}>
                    <input
                      id={`persyaratan-${item.id}`}
                      type="file"
                      className="hidden"
                      accept={parseValidTypes(item.valid_type)
                        .map((t) => `.${t}`)
                        .join(",")}
                      onChange={(e) => {
                        handleFileChange(item, e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                      disabled={isUploading || compressingId === item.id}
                    />

                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        hasCatatan
                          ? "bg-amber-100"
                          : isPending
                            ? "bg-blue-100"
                            : isUploaded
                              ? "bg-green-100"
                              : "bg-gray-200"
                      }`}>
                      {isPending ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-blue-700">OK</span>
                        </div>
                      ) : hasCatatan ? (
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

                    <div className="flex-1 min-w-0">
                      {isPending ? (
                        <>
                          <p className="text-sm font-medium text-blue-700 truncate">
                            {pendingFileName}
                          </p>
                          <p className="text-xs text-blue-500 mt-0.5">
                            Akan diunggah saat submit / simpan draft
                          </p>
                        </>
                      ) : hasCatatan ? (
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
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Ekstensi yang diterima:{" "}
                            {validTypeToAccept(item.valid_type)}.
                            <br />
                            Maksimal {item.size || "10 MB"} Mb. Jika PDF kebesaran, silakan kompres melalui{" "}
                            <a
                              href="https://www.ilovepdf.com/compress_pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline font-medium relative z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              iLovePDF
                            </a>
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {isUploaded && (
                  <a
                    href={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
});

export default UploadPersyaratanKhusus;