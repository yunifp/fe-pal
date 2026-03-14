import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import type {
  IUser,
  PaginatedUserResponse,
  UserCreateFormData,
  UserEditFormData,
} from "@/features/user/types/user";
import type { Response } from "@/types/response";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";

export const userService = {
  getByPagination: async (
    page: number = 1,
    search: string = ""
  ): Promise<Response<PaginatedUserResponse>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users`,
      {
        params: {
          page,
          search,
        },
      }
    );
    return response.data;
  },
  create: async (data: UserCreateFormData): Promise<Response<null>> => {
    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("username", data.username);
    formData.append("is_active", data.is_active ? "1" : "0");
    formData.append("password", data.password);
    formData.append("department_id", data.department_id ?? "");

    data.id_role.forEach((roleId) => {
      formData.append("id_role[]", roleId.toString());
    });

    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    const response = await axiosInstanceFormData.post(
      `${AUTH_SERVICE_BASE_URL}/users`,
      formData
    );

    return response.data;
  },
  getById: async (id: number): Promise<Response<IUser>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/${id}`
    );
    return response.data;
  },
  updateById: async (
    id: number,
    data: UserEditFormData
  ): Promise<Response<null>> => {
    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("username", data.username);
    formData.append("is_active", data.is_active ? "1" : "0");

    data.id_role.forEach((roleId) => {
      formData.append("id_role[]", roleId.toString());
    });

    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    const response = await axiosInstanceFormData.put(
      `${AUTH_SERVICE_BASE_URL}/users/${id}`,
      formData
    );

    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${AUTH_SERVICE_BASE_URL}/users/${id}`
    );
    return response.data;
  },
  exportExcel: async (): Promise<Blob> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/export-excel`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
