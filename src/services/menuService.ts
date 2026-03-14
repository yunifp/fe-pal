import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  IMenu,
  MenuFormData,
  MenuRequest,
  MenusResponse,
  PaginatedMenuResponse,
  UpdateAccessMenuRequest,
} from "@/types/menu";
import type { Response } from "@/types/response";

export const menuService = {
  getByPagination: async (
    page: number = 1,
    search: string = ""
  ): Promise<Response<PaginatedMenuResponse>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/menus`,
      {
        params: {
          page,
          search,
        },
      }
    );
    return response.data;
  },
  getAll: async (): Promise<Response<IMenu[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/menus/all`,
      {}
    );
    return response.data;
  },
  getById: async (id: number): Promise<Response<IMenu>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/menus/${id}`
    );
    return response.data;
  },
  getMenuAccess: async (idRole: number): Promise<Response<IMenu[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/menus/access/${idRole}`
    );
    return response.data;
  },
  updateMenuAccess: async (
    idMenu: number,
    idRole: number,
    access: string
  ): Promise<Response<MenusResponse & { update: boolean }>> => {
    const payload: UpdateAccessMenuRequest = {
      id_role: idRole,
      access,
    };

    const response = await axiosInstanceJson.put<
      Response<MenusResponse & { update: boolean }>
    >(`${AUTH_SERVICE_BASE_URL}/menus/access/${idMenu}`, payload);

    return response.data;
  },
  create: async (data: MenuFormData): Promise<Response<MenusResponse>> => {
    const payload: MenuRequest = {
      nama: data.nama,
      url: data.url,
      icon: data.icon,
      parent_id: data.parent_id,
      order: data.order,
    };
    const response = await axiosInstanceJson.post(
      `${AUTH_SERVICE_BASE_URL}/menus`,
      payload
    );
    return response.data;
  },
  updateById: async (
    id: number,
    data: MenuFormData
  ): Promise<Response<MenusResponse>> => {
    const payload: MenuRequest = {
      nama: data.nama,
      url: data.url,
      icon: data.icon,
      parent_id: data.parent_id,
      order: data.order,
    };
    const response = await axiosInstanceJson.put(
      `${AUTH_SERVICE_BASE_URL}/menus/${id}`,
      payload
    );
    return response.data;
  },
  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${AUTH_SERVICE_BASE_URL}/menus/${id}`
    );
    return response.data;
  },
};
