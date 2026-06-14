import axios, { AxiosError, type AxiosRequestConfig } from "axios";
// import { API_BASE_URL } from "@/constants/api";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/features/Auth/services/authService";
import { isRefreshing, setIsRefreshing, processQueue, addRequestToQueue } from "./axiosMutex";
// import { logService } from "@/services/logService";
// import qs from "qs";

const axiosInstanceJson = axios.create({
  // baseURL: API_BASE_URL,
  timeout: 160000, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstanceJson.interceptors.request.use((config) => {
  if (!config.headers?.get("Authorization")) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers?.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

// Response interceptor
axiosInstanceJson.interceptors.response.use(
  (response) => {
    // const user = useAuthStore.getState().user;

    // // 🔹 Serialize query params menggunakan qs
    // const params = response.config.params
    //   ? "?" + qs.stringify(response.config.params, { arrayFormat: "brackets" })
    //   : "";

    // void logService
    //   .logActivity({
    //     actor: user?.nama || "system",
    //     user_id: user?.id || null,
    //     http_method: response.config.method?.toUpperCase(),
    //     api_endpoint: `${response.config.url}${params}`, // backend endpoint lengkap
    //     frontend_url: window.location.pathname,
    //     status: "SUCCESS",
    //     ip_address: "0.0.0.0",
    //     user_agent: navigator.userAgent,
    //   })
    //   .catch((err) => console.error("Log gagal:", err));

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    
    // ===== handling refresh token =====
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRequestToQueue(resolve, reject);
        })
          .then((token) => {
            if (typeof token === "string") {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
            }
            return axiosInstanceJson(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      setIsRefreshing(true);

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

        return axiosInstanceJson(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        setIsRefreshing(false);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstanceJson;