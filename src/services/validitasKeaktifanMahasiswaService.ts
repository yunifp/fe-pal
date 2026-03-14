import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { GetLockDataRequest } from "@/types/pks";
import type { Response } from "@/types/response";
import type {
  AjukanValiditasKeaktifanMahasiswaFormData,
  PaginatedValiditasKeaktifanMahasiswa,
} from "@/types/validitasKeaktifanMahasiswa";

export const validitasKeaktifanMahasiswaService = {
  getByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedValiditasKeaktifanMahasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-keaktifan-mahasiswa`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },

  create: async (
    data: AjukanValiditasKeaktifanMahasiswaFormData,
  ): Promise<Response<null>> => {
    console.log("post");
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-keaktifan-mahasiswa`,
      {
        ...data,
      },
    );
    return response.data;
  },

  getLockedDataPks: async (
    data: GetLockDataRequest,
  ): Promise<Response<"Y" | "N">> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-keaktifan-mahasiswa/lock-data`,
      data,
    );

    return response.data;
  },
};
