import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedPekerjaanResponse, IPekerjaan } from "@/types/pekerjaan";

export const pekerjaanService = {
  getPaginated: async (
    page = 1,
    search = ""
  ): Promise<Response<PaginatedPekerjaanResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/pekerjaan/paginate`, {
      params: { page, limit: 10, search },
    });
    return res.data;
  },

  create: async (data: { nama_pekerjaan: string; is_active?: string }): Promise<Response<IPekerjaan>> => {
    const res = await axiosInstanceJson.post(`${MASTER_SERVICE_BASE_URL}/pekerjaan`, data);
    return res.data;
  },

  update: async (
    id: number,
    data: { nama_pekerjaan: string; is_active?: string }
  ): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/pekerjaan/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/pekerjaan/${id}`);
    return res.data;
  },
};