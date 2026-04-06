import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { PaginatedDokumenUmumResponse, IDokumenUmum } from "@/types/dokumenUmum";

const BASE_URL = `${MASTER_SERVICE_BASE_URL}/dokumen-umum`;

export const dokumenUmumService = {
  getPaginated: async (
    page = 1,
    search = ""
  ): Promise<Response<PaginatedDokumenUmumResponse>> => {
    const res = await axiosInstanceJson.get(`${BASE_URL}/paginate`, {
      params: { page, limit: 10, search },
    });
    return res.data;
  },

  create: async (data: Omit<IDokumenUmum, "id" | "created_at" | "updated_at">): Promise<Response<IDokumenUmum>> => {
    const res = await axiosInstanceJson.post(`${BASE_URL}`, data);
    return res.data;
  },

  update: async (id: number, data: Omit<IDokumenUmum, "id" | "created_at" | "updated_at">): Promise<Response<null>> => {
    const res = await axiosInstanceJson.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};