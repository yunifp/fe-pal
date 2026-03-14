export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const tanggal = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const jam = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // biar 24 jam
  });
  return `${tanggal} ${jam}`;
};

export const formatOnlyTime = (dateString: string) => {
  const date = new Date(dateString);
  const jam = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // biar 24 jam
  });
  return `${jam}`;
};

export function formatDateToMySQL(date: Date): string {
  // offset Waktu Indonesia Barat (WIB) = UTC+7
  const offsetMs = 7 * 60 * 60 * 1000;
  const localDate = new Date(date.getTime() + offsetMs);

  return localDate
    .toISOString() // 2025-09-23T17:45:30.000Z
    .slice(0, 19) // 2025-09-23T17:45:30
    .replace("T", " "); // 2025-09-23 17:45:30
}

export const formatTanggalIndo = (dateString?: string | null): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const bulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const tanggal = date.getDate();
  const bulan = bulanIndo[date.getMonth()];
  const tahun = date.getFullYear();

  return `${tanggal} ${bulan} ${tahun}`;
};

export const formatTanggalJamIndo = (dateString?: string | null): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const bulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const tanggal = date.getDate();
  const bulan = bulanIndo[date.getMonth()];
  const tahun = date.getFullYear();

  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  const detik = String(date.getSeconds()).padStart(2, "0");

  return `${tanggal} ${bulan} ${tahun} ${jam}:${menit}:${detik}`;
};

export const getCurrentMonthIndonesia = () => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const now = new Date();
  return months[now.getMonth()];
};

export const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};
