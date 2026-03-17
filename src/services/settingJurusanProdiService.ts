import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { Response } from "@/types/response";
import type { PaginatedProgramStudiResponse } from "@/types/programStudi";

export const settingJurusanProdiService = {
  getMappingJurusanProdi: async (
    idJurusanSekolah: number,
    page: number = 1,
    search: string = "",
    mappedOnly: boolean = false,
    idPt?: string 
  ): Promise<Response<PaginatedProgramStudiResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/setting-jurusan-prodi/${idJurusanSekolah}`,
      { params: { page, search, mapped_only: mappedOnly, id_pt: idPt } }
    );
    return response.data;
  },

  toggleMappingProdi: async (payload: {
    id_jurusan_sekolah: number;
    id_pt: number;
    id_prodi: number;
    is_mapped: boolean;
  }): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/setting-jurusan-prodi/toggle`,
      payload
    );
    return response.data;
  },
};