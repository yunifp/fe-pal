import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const publicService = {
  // Fungsi untuk mengecek status pendaftar di Landing Page
  cekStatusPendaftar: async (nik: string) => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data/public`, {
      params: { nik },
    });
    return response.data;
  },
};