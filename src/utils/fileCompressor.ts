/* eslint-disable @typescript-eslint/no-unused-vars */
import imageCompression from "browser-image-compression";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/**
 * Parse string size dari DB ke bytes
 * Format: "2 mb", "500 kb", "5mb", "1024kb"
 * Ini sekarang HANYA digunakan oleh validasi Hard-Block di UI (seperti untuk PDF)
 */
export const parseSizeToBytes = (sizeStr?: string): number => {
  if (!sizeStr) return 1 * 1024 * 1024;
  const clean = sizeStr.toLowerCase().replace(/\s/g, "");
  const num = parseFloat(clean);
  if (clean.includes("mb")) return num * 1024 * 1024;
  if (clean.includes("kb")) return num * 1024;
  return 2 * 1024 * 1024;
};

/**
 * Kompres gambar jika file adalah image, return as-is jika bukan.
 * TARGET KOMPRESI DIPAKSA KE 1 MB UNTUK SEMUA GAMBAR.
 */
export const compressIfImage = async (
  file: File,
  _maxSizeStr?: string, // Tidak dipakai lagi untuk gambar, tapi tetap ada agar pemanggilan fungsi tidak error
): Promise<File> => {
  if (!IMAGE_TYPES.includes(file.type)) {
    // Bukan gambar (PDF, dll) — kembalikan apa adanya
    return file;
  }

  // ✅ PAKSA TARGET KOMPRESI JADI 1 MB
  const targetSizeMB = 1;
  const targetSizeBytes = targetSizeMB * 1024 * 1024;

  // Jika ukuran file foto memang sudah di bawah 1 MB, kembalikan saja (jangan dirusak kualitasnya)
  if (file.size <= targetSizeBytes) return file;

  const options = {
    maxSizeMB: targetSizeMB, // Target maksimal file size adalah 1 MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
    onProgress: undefined, 
  };

  const compressed = await imageCompression(file, options);

  // Kembalikan sebagai File (bukan Blob) agar kompatibel dengan FormData
  return new File([compressed], file.name, { type: file.type });
};