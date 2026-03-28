import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const penelaahanService = {
  getListPenelaahan: async (page: number = 1, limit: number = 10, search: string = "") => {
    const response = await axiosInstanceBeasiswa.get(`/penelaahan/list`, { params: { page, limit, search } });
    return response.data;
  },

  downloadExcelPerankingan: async () => {
    const response = await axiosInstanceBeasiswa.get(`/penelaahan/download-excel`, { responseType: "blob" });
    return response.data;
  },

  uploadHasilPerankingan: async (formData: FormData) => {
    const response = await axiosInstanceBeasiswa.post(`/penelaahan/upload-hasil`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getListHasilPerankingan: async (page: number = 1, limit: number = 10, search: string = "") => {
    const response = await axiosInstanceBeasiswa.get(`/penelaahan/hasil`, { params: { page, limit, search } });
    return response.data;
  },
  kirimHasilPerankingan: async () => {
    const response = await axiosInstanceBeasiswa.put(`/penelaahan/kirim`);
    return response.data;
  },
  resetHasilPerankingan: async () => {
    const response = await axiosInstanceBeasiswa.put(`/penelaahan/reset`);
    return response.data;
  }
};