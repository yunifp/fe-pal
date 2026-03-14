export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1];
  const byteString = atob(parts[1]);
  const array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

export const parseValidTypes = (validType: string): string[] =>
  validType
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

export const isValidByDocType = (file: File, validTypeStr: string): boolean => {
  const allowedTypes = parseValidTypes(validTypeStr);
  const ext = file.name.split(".").pop()?.toLowerCase();
  return !!ext && allowedTypes.includes(ext);
};

// utils/fileUtils.ts
export const base64ToFile = (
  base64: string,
  filename: string = "signature.png",
): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
