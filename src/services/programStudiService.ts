import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { Response } from "@/types/response";
import type {
  IProgramStudi,
  PaginatedProgramStudiResponse,
  ProgramStudiFormData,
} from "@/types/programStudi";

export const programStudiService = {
  getProgramStudiByPtPagination: async (
    idPt: number,
    page: number = 1,
    search: string = ""
  ): Promise<Response<PaginatedProgramStudiResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/program-studi/pt/${idPt}`,
      { params: { page, search } }
    );
    return response.data;
  },

  getAllProgramStudiPagination: async (
    page: number = 1,
    search: string = ""
  ): Promise<Response<PaginatedProgramStudiResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/program-studi`,
      { params: { page, search } }
    );
    return response.data;
  },

  getDetailProgramStudi: async (idProdi: number): Promise<Response<IProgramStudi>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/program-studi/${idProdi}`
    );
    return response.data;
  },
 createProgramStudi: async (data: ProgramStudiFormData): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/program-studi`,
      data 
    );
    return response.data;
  },
  updateProgramStudi: async (idProdi: number, data: ProgramStudiFormData): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/program-studi/${idProdi}`,
      data
    );
    return response.data;
  },
  deleteProgramStudi: async (idProdi: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/program-studi/${idProdi}`
    );
    return response.data;
  },
  updateKuotaButaWarna: async (
    idProdi: number, 
    payload: { kuota?: number; boleh_buta_warna?: "Y" | "N" }
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.patch(
      `${MASTER_SERVICE_BASE_URL}/program-studi/${idProdi}/setting-kuota`,
      payload
    );
    return response.data;
  },
};