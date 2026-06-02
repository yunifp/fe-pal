import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedWilayahKhususResponse } from "@/types/wilayahKhusus";

export const wilayahKhususService = {
  getPaginated: async (
    page = 1,
    search = "",
    is_khusus?: string
  ): Promise<Response<PaginatedWilayahKhususResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/wilayah-khusus/paginate`, {
      params: { page, limit: 10, search, is_khusus },
    });
    return res.data;
  },

  update: async (
    id: number,
    data: { wilayah_3t: boolean; wilayah_perbatasan: boolean; wilayah_papua_nusateng: boolean; wilayah_terluar: boolean }
  ): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/wilayah-khusus/${id}`, data);
    return res.data;
  },

  reset: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/wilayah-khusus/${id}`);
    return res.data;
  },
};