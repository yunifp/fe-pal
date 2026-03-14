import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { Response } from "@/types/response";
import type {
  StatistikPengajuan,
  StatistikPerubahanDataMahasiswa,
} from "@/types/statistik";

export const statistikService = {
  getPengajuanBiaya: async (): Promise<Response<StatistikPengajuan[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/statistik/pengajuan-biaya`,
    );
    return response.data;
  },

  getPerubahanDataMahasiswa: async (): Promise<
    Response<StatistikPerubahanDataMahasiswa[]>
  > => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/statistik/jumlah-perubahan-data-mahasiswa`,
    );
    return response.data;
  },
};
