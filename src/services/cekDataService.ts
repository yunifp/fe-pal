import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const cekDataService = {
  // Ubah parameter menjadi keyword (bisa NIK atau Kode Pendaftaran)
  cekDataByKeyword: async (keyword: string) => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data`, {
      params: { keyword },
    });
    return response.data;
  },
};