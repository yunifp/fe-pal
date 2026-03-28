import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const cekDataService = {
  cekDataByNik: async (nik: string) => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data`, {
      params: { nik },
    });
    return response.data;
  },
};