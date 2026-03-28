import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const rekomtekService = {
  getListRekomtek: async (page: number = 1, limit: number = 10, search: string = "") => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/list`, { params: { page, limit, search } });
    return response.data;
  },
  
  downloadDataRekomtek: async () => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/download`, { responseType: "blob" });
    return response.data;
  },
  
  cekDokumenRekomtek: async () => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/cek-dokumen`);
    return response.data;
  },
  
  uploadDokumen: async (formData: FormData) => {
    const response = await axiosInstanceBeasiswa.post(`/rekomtek/upload-dokumen`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  
  kirimKeFlow14: async () => {
    const response = await axiosInstanceBeasiswa.put(`/rekomtek/kirim`);
    return response.data;
  }
};