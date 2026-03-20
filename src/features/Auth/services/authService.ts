/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import axios from "axios";
import { AUTH_SERVICE_BASE_URL } from "@/constants/api";
import type {
  IProfile,
  LoginRequest,
  LoginResponse,
  ProfileFormData,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import type { Response } from "@/types/response";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import type { IUser } from "@/features/user/types/user";

export const authService = {
  login: async (payload: LoginRequest): Promise<Response<LoginResponse>> => {
  
    const response = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/auth/login`,
      payload,
    );
    return response.data;
  },
  
  getCaptcha: async (): Promise<
    Response<{ captchaId: string; question: string }>
  > => {
    const response = await axios.get<
      Response<{ captchaId: string; question: string }>
    >(`${AUTH_SERVICE_BASE_URL}/auth/captcha`);

    return response.data;
  },
  
  verifyCaptcha: async (payload: {
    captchaId: string;
    answer: string;
  }): Promise<boolean> => {
    const response = await axios.post<Response<boolean>>(
      `${AUTH_SERVICE_BASE_URL}/auth/verify-captcha`,
      payload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data!; 
  },
  
  register: async (
    data: RegisterRequest & { captchaId?: string; answer?: number }, // Pastikan tipe data menerima captcha
  ): Promise<Response<RegisterResponse | null>> => {
    const formData = new FormData();
    formData.append("jenis_akun", data.jenis_akun);
    formData.append("nama_lengkap", data.nama_lengkap);
    formData.append("email", data.email);
    formData.append("no_hp", data.no_hp);

    if (data.username) {
      formData.append("username", data.username);
    }
    if (data.password) {
      formData.append("password", data.password);
    }

    // Field opsional
    if (data.prov) formData.append("kode_prov", data.prov);
    if (data.kabkota) formData.append("kode_kab", data.kabkota);
    if (data.id_perguruan_tinggi)
      formData.append("id_perguruan_tinggi", data.id_perguruan_tinggi);

    if (data.id_jenjang) formData.append("id_jenjang", data.id_jenjang);

    // File
    if (data.surat_penunjukan) {
      formData.append("surat_penunjukan", data.surat_penunjukan);
    }

  
    if (data.captchaId) {
      formData.append("captchaId", data.captchaId);
    }
    if (data.answer !== undefined) {
      formData.append("answer", data.answer.toString());
    }

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/auth/register`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/auth/refresh-token`,
      {
        refreshToken: refreshToken,
      },
    );
    return response.data;
  },
  
  getProfile: async (): Promise<Response<IProfile>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/auth/profile`,
    );
    return response.data;
  },
  
  updateProfile: async (
    payload: ProfileFormData,
  ): Promise<Response<IProfile>> => {
    const formData = new FormData();
    formData.append("nama", payload.nama);

    if (payload.current_pin) {
      formData.append("current_pin", payload.current_pin!!);
    }

    if (payload.pin) {
      formData.append("pin", payload.pin!!);
    }

    if (payload.avatar && payload.avatar instanceof File) {
      formData.append("avatar", payload.avatar);
    }
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await axiosInstanceFormData.put<Response<IProfile>>(
      `${AUTH_SERVICE_BASE_URL}/auth/profile`,
      formData,
    );

    return response.data;
  },
  
  logout: async (
    refreshToken: string,
  ): Promise<Response<{ message: string }>> => {
    const response = await axios.post(`${AUTH_SERVICE_BASE_URL}/auth/logout`, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getOpPt: async (idPt: string): Promise<Response<IUser[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/op-pt/${idPt}`,
      {},
    );
    return response.data;
  },

  getVerifPt: async (idPt: string): Promise<Response<IUser[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/verif-pt/${idPt}`,
      {},
    );
    return response.data;
  },

  forgotPin: async (email: string): Promise<Response<null>> => {
    const response = await axios.post(`${AUTH_SERVICE_BASE_URL}/auth/forgot-pin`, {
      email,
    });
    return response.data;
  },
};