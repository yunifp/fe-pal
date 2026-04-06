import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedJalurMasterResponse, IJalurMaster } from "@/types/jalurMaster";

const BASE_URL = `${MASTER_SERVICE_BASE_URL}/jalur`;

export const jalurMasterService = {
  getPaginated: async (
  page = 1,
  search = "",
  limit = 10 // <-- WAJIB TAMBAHKAN INI
): Promise<Response<PaginatedJalurMasterResponse>> => {
  const res = await axiosInstanceJson.get(`${BASE_URL}/paginate`, {
    params: { page, limit, search }, // <-- Ganti limit: 10 menjadi variabel limit
  });
  return res.data;
},

  create: async (data: { jalur: string }): Promise<Response<IJalurMaster>> => {
    const res = await axiosInstanceJson.post(`${BASE_URL}`, data);
    return res.data;
  },

  update: async (id: number, data: { jalur: string }): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};