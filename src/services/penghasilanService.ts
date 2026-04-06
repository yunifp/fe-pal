import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedPenghasilanResponse, IPenghasilan } from "@/types/penghasilan";

export const penghasilanService = {
  getPaginated: async (
    page = 1,
    search = ""
  ): Promise<Response<PaginatedPenghasilanResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/penghasilan/paginate`, {
      params: { page, limit: 10, search },
    });
    return res.data;
  },

  create: async (data: { rentang_penghasilan: string; is_active?: string }): Promise<Response<IPenghasilan>> => {
    const res = await axiosInstanceJson.post(`${MASTER_SERVICE_BASE_URL}/penghasilan`, data);
    return res.data;
  },

  update: async (
    id: number,
    data: { rentang_penghasilan: string; is_active?: string }
  ): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/penghasilan/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/penghasilan/${id}`);
    return res.data;
  },
};