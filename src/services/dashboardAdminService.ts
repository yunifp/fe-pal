import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa"; // Pakai instance beasiswa
import type { Response } from "@/types/response";
import type { DashboardStatsResponse } from "../types/dashboard";

// Gunakan path relatif, baseURL sudah diatur di axiosInstanceBeasiswa
const BASE_PATH = "/dashboard";

export const dashboardAdminService = {
  // Ambil stats dashboard dengan filter id_beasiswa jika ada
  getStats: async (id_beasiswa?: string): Promise<Response<DashboardStatsResponse>> => {
    const response = await axiosInstanceBeasiswa.get(`${BASE_PATH}/stats`, {
      params: id_beasiswa && id_beasiswa !== "all" ? { id_beasiswa } : {}
    });
    return response.data;
  },
};