import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa"; // Pakai ini Bos
import type { Response } from "@/types/response";
import type { PaginatedLaporanPendaftarResponse } from "@/types/laporanPendaftar";


const BASE_PATH = "/laporan/pendaftar";

export const laporanPendaftarService = {
  getPaginated: async (
    page = 1, 
    search = "", 
    tipe_laporan = "1", 
    id_jalur = ""
  ): Promise<Response<PaginatedLaporanPendaftarResponse>> => {
    const res = await axiosInstanceBeasiswa.get(`${BASE_PATH}/paginate`, {
      params: { page, limit: 10, search, tipe_laporan, id_jalur },
    });
    return res.data;
  },

  exportExcel: async (search = "", tipe_laporan = "1", id_jalur = "") => {
    const res = await axiosInstanceBeasiswa.get(`${BASE_PATH}/export`, {
      params: { search, tipe_laporan, id_jalur },
      responseType: "blob", // Tetap pakai blob untuk excel
    });
    return res.data;
  },

  getJalurList: async (): Promise<Response<string[]>> => {
    const res = await axiosInstanceBeasiswa.get(`${BASE_PATH}/list-jalur`);
    return res.data;
  },
};