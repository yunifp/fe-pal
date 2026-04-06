import axiosInstanceJson from "@/lib/axiosInstanceJson";
import { MASTER_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import type { IReferensiWilayah, PaginatedReferensiWilayahResponse } from "@/types/wilayah";

export const referensiWilayahService = {
  getProvinsiPaginated: async (page = 1, search = ""): Promise<Response<PaginatedReferensiWilayahResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/referensi-wilayah/provinsi/paginate`, { params: { page, limit: 10, search } });
    return res.data;
  },
  getKabKotaPaginated: async (kode_pro: number, page = 1, search = ""): Promise<Response<PaginatedReferensiWilayahResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/referensi-wilayah/kabkota/paginate`, { params: { kode_pro, page, limit: 10, search } });
    return res.data;
  },
  getKecamatanPaginated: async (kode_kab: number, page = 1, search = ""): Promise<Response<PaginatedReferensiWilayahResponse>> => {
    const res = await axiosInstanceJson.get(`${MASTER_SERVICE_BASE_URL}/referensi-wilayah/kecamatan/paginate`, { params: { kode_kab, page, limit: 10, search } });
    return res.data;
  },
  updateWilayah: async (id: number, nama_wilayah: string): Promise<Response<IReferensiWilayah>> => {
    const res = await axiosInstanceJson.put(`${MASTER_SERVICE_BASE_URL}/referensi-wilayah/${id}`, { nama_wilayah });
    return res.data;
  },
  deleteWilayah: async (id: number): Promise<Response<null>> => {
    const res = await axiosInstanceJson.delete(`${MASTER_SERVICE_BASE_URL}/referensi-wilayah/${id}`);
    return res.data;
  }
};