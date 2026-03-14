import type { Response } from "@/types/response";
import type { IDashboard } from "../types/dashboard";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { API_BASE_URL } from "@/constants/api";

export const dashboardService = {
  getData: async (): Promise<Response<IDashboard>> => {
    const response = await axiosInstanceJson.get(`${API_BASE_URL}/dashboard`);
    return response.data;
  },
};
