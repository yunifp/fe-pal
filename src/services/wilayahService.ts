import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { IWilayah } from "@/types/master"; // ✅ Ubah import
import type { Response } from "@/types/response";

export const wilayahService = {
  getProvinsi: async (): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/provinsi`,
    );
    return response.data;
  },

  getKabKotByProvinsi: async (
    kodeProv: string,
  ): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/kabkot/${kodeProv}`,
    );
    return response.data;
  },

  getKecamatanByKabKot: async (
    kodeKabKot: string,
  ): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/kecamatan/${kodeKabKot}`,
    );
    return response.data;
  },

  getKelurahanByKecamatan: async (
    kodeKecamatan: string,
  ): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/kelurahan/${kodeKecamatan}`,
    );
    return response.data;
  },
};
