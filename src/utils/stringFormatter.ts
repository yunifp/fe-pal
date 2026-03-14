import type { IPilihanProgramStudi } from "@/types/beasiswa";

export const truncateText = (text: string, maxLength: number = 80) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const normalizeHashValue = (value?: string, index = 1): string => {
  if (!value) return "";
  return value.split("#")[index] ?? "";
};

export const validTypeToAccept = (validType: string): string =>
  validType
    .split(",")
    .map((t) => `.${t.trim().toLowerCase()}`)
    .filter((t) => t !== ".")
    .join(", ");

export const mapPilihanProgramStudiToForm = (
  data?: IPilihanProgramStudi[] | null,
) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    perguruan_tinggi: `${item.id_pt}#${item.nama_pt}`,
    program_studi: `${item.id_prodi}#${item.nama_prodi}`,
  }));
};

export const formatRupiah = (number?: number) => {
  const safeNumber = Number(number) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(safeNumber);
};
export const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");

export const toUpperCase = (value: string) => value.toUpperCase();
