import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import type {
  IRole,
  PaginatedRoleResponse,
  RoleFormData,
  RoleRequest,
} from "../types/role";
import type { Response } from "@/types/response";
import axiosInstanceJson from "@/lib/axiosInstanceJson";

export const roleService = {
  getByPagination: async (
    page: number = 1,
    search: string = ""
  ): Promise<Response<PaginatedRoleResponse>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/roles`,
      {
        params: {
          page,
          search,
        },
      }
    );
    return response.data;
  },
  getAll: async (): Promise<Response<IRole[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/roles/all`
    );
    return response.data;
  },
  getById: async (id: number): Promise<Response<IRole>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/roles/${id}`
    );
    return response.data;
  },
  create: async (data: RoleFormData): Promise<Response<null>> => {
    const payload: RoleRequest = {
      nama: data.nama,
    };
    const response = await axiosInstanceJson.post(
      `${AUTH_SERVICE_BASE_URL}/roles`,
      payload
    );
    return response.data;
  },
  updateById: async (
    id: number,
    data: RoleFormData
  ): Promise<Response<null>> => {
    const payload: RoleRequest = {
      nama: data.nama,
    };
    const response = await axiosInstanceJson.put(
      `${AUTH_SERVICE_BASE_URL}/roles/${id}`,
      payload
    );
    return response.data;
  },
  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${AUTH_SERVICE_BASE_URL}/roles/${id}`
    );
    return response.data;
  },
};
