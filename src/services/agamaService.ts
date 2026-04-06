import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedAgamaResponse, IAgama } from "@/types/agama";

export const agamaService = {
  getPaginated: async (
    page = 1,
    search = ""
  ): Promise<Response<PaginatedAgamaResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/agama/paginate`, {
      params: { page, limit: 10, search },
    });
    return res.data;
  },

  create: async (data: { nama_agama: string; is_active?: string }): Promise<Response<IAgama>> => {
    const res = await axiosInstanceJson.post(`${MASTER_SERVICE_BASE_URL}/agama`, data);
    return res.data;
  },

  update: async (
    id: number,
    data: { nama_agama: string; is_active?: string }
  ): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/agama/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/agama/${id}`);
    return res.data;
  },
};