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
  }
};