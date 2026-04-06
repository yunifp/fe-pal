import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedSukuMasterResponse, ISukuMaster } from "@/types/suku";

const BASE_URL = `${MASTER_SERVICE_BASE_URL}/suku`;

export const sukuMasterService = {
  getPaginated: async (
    page = 1,
    search = "",
    limit = 10
  ): Promise<Response<PaginatedSukuMasterResponse>> => {
    const res = await axiosInstanceJson.get(`${BASE_URL}/paginate`, {
      params: { page, limit, search },
    });
    return res.data;
  },

  create: async (data: { nama_suku: string; is_active: "Y" | "N" }): Promise<Response<ISukuMaster>> => {
    const res = await axiosInstanceJson.post(`${BASE_URL}`, data);
    return res.data;
  },

  update: async (id: number, data: { nama_suku: string; is_active: "Y" | "N" }): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};