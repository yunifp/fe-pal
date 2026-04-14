import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const penetapanService = {
  // Untuk halaman utama
  getListMaster: async () => {
    const response = await axiosInstanceBeasiswa.get(`/penetapan/master`);
    return response.data;
  },
  
  // Untuk halaman detail
  getListDetail: async (page: number = 1, limit: number = 10, search: string = "", id_ref?: string) => {
    const response = await axiosInstanceBeasiswa.get(`/penetapan/detail`, {
      params: { page, limit, search, id_ref },
    });
    return response.data;
  },
  
  cekDokumenPenetapan: async () => {
    const response = await axiosInstanceBeasiswa.get(`/penetapan/cek-dokumen`);
    return response.data;
  },
  downloadDataPenetapan: async (id_ref?: string) => {
    const params: Record<string, string> = {};
    if (id_ref) params.id_ref = id_ref;

    const response = await axiosInstanceBeasiswa.get('/penetapan/download', { // Sesuaikan URL dengan route backend Anda
      params,
      responseType: 'blob', // Penting untuk download file
    });
    return response.data;
  },
};