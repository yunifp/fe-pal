import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import type {
  AdminVerifikatorLpCreateFormData,
  AdminVerifikatorLpEditFormData,
  IAdminVerifikator,
  PaginatedAdminVerifikatorResponse,
} from "../types/db";

export const dbService = {
  getByPaginationLp: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
  ): Promise<Response<PaginatedAdminVerifikatorResponse>> => {
    const params: any = {
      page,
      search,
    };

    if (lpId !== null) {
      params.lpId = lpId;
    }

    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-lp`,
      { params },
    );

    return response.data;
  },

  createLp: async (
    data: AdminVerifikatorLpCreateFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();
    formData.append("jenis_akun", data.jenis_akun);
    formData.append("jabatan", data.jabatan);
    formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    formData.append("nama", data.nama);
    formData.append("no_hp", data.no_hp);
    formData.append("email", data.email);
    formData.append("is_active", data.is_active ? "1" : "0");

    if (data.surat_penunjukan instanceof File) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

    const response = await axiosInstanceFormData.post(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-lp`,
      formData,
    );

    return response.data;
  },

  updateLp: async (
    id: number,
    data: AdminVerifikatorLpEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.jenis_akun) {
      formData.append("jenis_akun", data.jenis_akun);
    }

    if (data.jabatan) {
      formData.append("jabatan", data.jabatan);
    }

    if (data.lembaga_pendidikan) {
      formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    }

    if (data.nama) {
      formData.append("nama", data.nama);
    }

    if (data.no_hp) {
      formData.append("no_hp", data.no_hp);
    }

    if (data.email) {
      formData.append("email", data.email);
    }

    // is_active tetap dikirim meskipun 0
    if (typeof data.is_active !== "undefined") {
      formData.append("is_active", data.is_active ? "1" : "0");
    }

    if (data.surat_penunjukan instanceof File) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

    const response = await axiosInstanceFormData.put(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-lp/${id}`,
      formData,
    );

    return response.data;
  },

  getDetailById: async (id: number): Promise<Response<IAdminVerifikator>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-lp/${id}`,
    );
    return response.data;
  },
  updateById: async (
    id: number,
    data: AdminVerifikatorLpEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.jenis_akun !== undefined) {
      formData.append("jenis_akun", data.jenis_akun);
    }
    if (data.lembaga_pendidikan !== undefined) {
      formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    }
    if (data.nama !== undefined) {
      formData.append("nama", data.nama);
    }
    if (data.no_hp !== undefined) {
      formData.append("no_hp", data.no_hp);
    }
    if (data.email !== undefined) {
      formData.append("email", data.email);
    }
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active ? "1" : "0");
    }
    if (data.surat_penunjukan instanceof File) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

    const response = await axiosInstanceFormData.put(
      `${AUTH_SERVICE_BASE_URL}/users/${id}`,
      formData,
    );

    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-lp/${id}`,
    );
    return response.data;
  },
};
