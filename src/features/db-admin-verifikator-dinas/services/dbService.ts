/* eslint-disable @typescript-eslint/no-explicit-any */
import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import type { Response } from "@/types/response";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import type {
  AdminVerifikatorDinasCreateFormData,
  AdminVerifikatorDinasEditFormData,
  IAdminVerifikator,
  PaginatedAdminVerifikatorResponse,
} from "../types/db";

export const dbService = {
  getByPaginationDinas: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedAdminVerifikatorResponse>> => {
    const params: any = { page, search };
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-dinas`,
      { params },
    );
    return response.data;
  },

  createDinas: async (
    data: AdminVerifikatorDinasCreateFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.jenis_akun) formData.append("jenis_akun", data.jenis_akun);
    if (data.username) formData.append("username", data.username);
    if (data.password) formData.append("password", data.password);
    if (data.nama) formData.append("nama", data.nama);
    if (data.no_hp) formData.append("no_hp", data.no_hp);
    if (data.email) formData.append("email", data.email);
    if (data.provinsi) formData.append("provinsi", data.provinsi);
    if (data.kabkota) formData.append("kabkota", data.kabkota);

    formData.append("is_active", data.is_active ? "1" : "0");

    if (data.surat_penunjukan instanceof File) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

    const response = await axiosInstanceFormData.post(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-dinas`,
      formData,
    );

    return response.data;
  },

  updateDinas: async (
    id: number,
    data: AdminVerifikatorDinasEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.jenis_akun) formData.append("jenis_akun", data.jenis_akun);
    if (data.username) formData.append("username", data.username);
    if (data.password) formData.append("password", data.password);
    if (data.nama) formData.append("nama", data.nama);
    if (data.no_hp) formData.append("no_hp", data.no_hp);
    if (data.email) formData.append("email", data.email);
    if (data.provinsi) formData.append("provinsi", data.provinsi);
    if (data.kabkota) formData.append("kabkota", data.kabkota);

    if (typeof data.is_active !== "undefined") {
      formData.append("is_active", data.is_active ? "1" : "0");
    }

    if (data.surat_penunjukan instanceof File) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

    const response = await axiosInstanceFormData.put(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-dinas/${id}`,
      formData,
    );

    return response.data;
  },

  getDetailById: async (id: number): Promise<Response<IAdminVerifikator>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-dinas/${id}`,
    );
    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${AUTH_SERVICE_BASE_URL}/db-admin-verifikator-dinas/${id}`,
    );
    return response.data;
  },
};