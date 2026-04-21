import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const rekomtekService = {
  getListRekomtek: async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    jenjang?: string,
    perguruan_tinggi?: string
  ) => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/list`, {
      params: { page, limit, search, jenjang, perguruan_tinggi },
    });
    return response.data;
  },

  downloadDataRekomtek: async (jenjang?: string, perguruan_tinggi?: string) => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/download`, {
      params: { jenjang, perguruan_tinggi },
      responseType: "blob",
    });
    return response.data;
  },

  cekDokumenRekomtek: async () => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/cek-dokumen`);
    return response.data;
  },

  uploadDokumen: async (formData: FormData) => {
    const response = await axiosInstanceBeasiswa.post(
      `/rekomtek/upload-dokumen`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  kirimKeFlow14: async () => {
    const response = await axiosInstanceBeasiswa.put(`/rekomtek/kirim`);
    return response.data;
  },

  setMengundurkanDiri: async (id: number) => {
    const response = await axiosInstanceBeasiswa.put(
      `/rekomtek/mengundurkan-diri/${id}`
    );
    return response.data;
  },

  getSummaryKuota: async () => {
    const response = await axiosInstanceBeasiswa.get(`/rekomtek/summary-kuota`);
    return response.data;
  },

  batalMengundurkanDiri: async (id: number) => {
    const response = await axiosInstanceBeasiswa.put(
      `/rekomtek/batal-mengundurkan-diri/${id}`
    );
    return response.data;
  },
};