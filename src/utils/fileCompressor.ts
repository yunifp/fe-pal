import imageCompression from "browser-image-compression";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export const parseSizeToBytes = (sizeValue?: string | number): number => {
  if (sizeValue === undefined || sizeValue === null || sizeValue === "") return 2 * 1024 * 1024;
  const str = String(sizeValue).toLowerCase().replace(/\s/g, "");
  const num = parseFloat(str);
  if (isNaN(num)) return 2 * 1024 * 1024;
  if (str.includes("kb")) return num * 1024;
  if (str.includes("b") && !str.includes("mb") && !str.includes("kb")) return num;
  return num * 1024 * 1024;
};

export const compressIfImage = async (
  file: File,
  _maxSizeStr?: string | number,
): Promise<File> => {
  if (!IMAGE_TYPES.includes(file.type)) {
    return file;
  }
  const targetSizeMB = 1;
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  if (file.size <= targetSizeBytes) return file;
  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
    onProgress: undefined,
  };
  const compressed = await imageCompression(file, options);
  return new File([compressed], file.name, { type: file.type });
};