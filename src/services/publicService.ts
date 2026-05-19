import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const publicService = {
  cekStatusPendaftar: async (nik: string) => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data/public`, {
      params: { keyword: nik },
    });
    return response.data;
  },
};