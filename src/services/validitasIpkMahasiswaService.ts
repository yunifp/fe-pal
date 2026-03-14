import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { Response } from "@/types/response";
import type {
  AjukanValiditasIpkMahasiswaFormData,
  GetLockDataRequest,
  ListIpkWithMahasiswa,
  PaginatedValiditasIpkMahasiswa,
} from "@/types/validitasIpkMahasiswa";

export const validitasIpkMahasiswaService = {
  getByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedValiditasIpkMahasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-ipk-mahasiswa`,
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
    data: AjukanValiditasIpkMahasiswaFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-ipk-mahasiswa`,
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
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-ipk-mahasiswa/lock-data`,
      data,
    );

    return response.data;
  },

  getListIpk: async (
    idTrxPks: string,
    semester: number,
  ): Promise<Response<ListIpkWithMahasiswa[]>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/validitas-ipk-mahasiswa/list-ipk`,
      {
        id_trx_pks: idTrxPks,
        semester,
      },
    );
    return response.data;
  },
};
