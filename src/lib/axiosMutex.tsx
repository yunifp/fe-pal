// src/lib/axiosMutex.ts

export let isRefreshing = false;
export let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

export const setIsRefreshing = (value: boolean) => {
  isRefreshing = value;
};

export const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const addRequestToQueue = (resolve: (value?: unknown) => void, reject: (reason?: unknown) => void) => {
  failedQueue.push({ resolve, reject });
};