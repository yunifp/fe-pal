import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/constants/api";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/features/Auth/services/authService";

const axiosInstanceFormData = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// =====================
// Refresh control
// =====================
let isRefreshing = false;
type QueueError = unknown;

let failedQueue: {
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}[] = [];

const processQueue = (error: QueueError, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// =====================
// Request interceptor
// =====================
axiosInstanceFormData.interceptors.request.use((config) => {
  if (!config.headers?.get("Authorization")) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers?.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

// =====================
// Response interceptor
// =====================
axiosInstanceFormData.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (typeof token === "string") {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
            }
            return axiosInstanceFormData(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await authService.refreshToken(refreshToken);
        const newAccessToken = res.data.accessToken;

        useAuthStore.setState({ accessToken: newAccessToken });

        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return axiosInstanceFormData(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstanceFormData;
