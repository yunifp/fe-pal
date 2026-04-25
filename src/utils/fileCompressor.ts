import imageCompression from "browser-image-compression";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/**
 * Parse string size dari DB ke bytes
 * Format: "2 mb", "500 kb", "5mb", "1024kb"
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
 * Kompres gambar jika file adalah image, return as-is jika bukan
 * maxSizeMB dihitung dari size string DB
 */
export const compressIfImage = async (
  file: File,
  maxSizeStr?: string,
): Promise<File> => {
  if (!IMAGE_TYPES.includes(file.type)) {
    // Bukan gambar (PDF, dll) — kembalikan apa adanya
    return file;
  }

  const maxSizeBytes = parseSizeToBytes(maxSizeStr);
  const maxSizeMB = maxSizeBytes / (1024 * 1024);

  // Jika sudah di bawah limit, tidak perlu kompres
  if (file.size <= maxSizeBytes) return file;

  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
    onProgress: undefined, // bisa diisi callback jika ingin progress bar
  };

  const compressed = await imageCompression(file, options);

  // Kembalikan sebagai File (bukan Blob) agar kompatibel dengan FormData
  return new File([compressed], file.name, { type: file.type });
};
