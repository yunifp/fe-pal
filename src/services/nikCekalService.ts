import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedNikCekalResponse, INikCekal } from "@/types/nikCekal";

export const nikCekalService = {
  getPaginated: async (
    page = 1,
    search = ""
  ): Promise<Response<PaginatedNikCekalResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/nik-cekal/paginate`, {
      params: { page, limit: 10, search },
    });
    return res.data;
  },

  create: async (data: { nik: string; nama?: string; tahun?: string; keterangan?: string; is_aktif?: string }): Promise<Response<INikCekal>> => {
    const res = await axiosInstanceJson.post(`${MASTER_SERVICE_BASE_URL}/nik-cekal`, data);
    return res.data;
  },

  update: async (
    id: number,
    data: { nik: string; nama?: string; tahun?: string; keterangan?: string; is_aktif?: string }
  ): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/nik-cekal/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/nik-cekal/${id}`);
    return res.data;
  },
  // Tambahkan fungsi ini di dalam object nikCekalService
  exportExcel: async (search = ""): Promise<Blob> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/nik-cekal/export`, {
      params: { search },
      responseType: "blob",
    });
    return res.data;
  },
};

