import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const wawancaraService = {
  getListWawancara: async (page: number = 1, limit: number = 10, search: string = "") => {
    const response = await axiosInstanceBeasiswa.get(`/wawancara`, {
      params: { page, limit, search },
    });
    return response.data;
  },

  downloadExcel: async () => {
    const response = await axiosInstanceBeasiswa.get(`/wawancara/download-excel`, {
      responseType: "blob", 
    });
    return response.data;
  },

  kirimDataWawancara: async () => {
    const response = await axiosInstanceBeasiswa.put(`/wawancara/kirim`);
    return response.data;
  },

  updateStatusWawancara: async (idTrxBeasiswa: number, status_wawancara: string) => {
    const response = await axiosInstanceBeasiswa.put(`/wawancara/${idTrxBeasiswa}`, {
        status_wawancara,
    });
    return response.data;
  }
};