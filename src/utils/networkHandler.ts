import type { ErrorType } from "@/components/ErrorState";
import type { AxiosError } from "axios";

export const getErrorType = (error: unknown): ErrorType => {
  const status = (error as AxiosError)?.response?.status;

  if (!status) return "network"; // no response = backend mati
  if (status === 404) return "not_found";
  if (status === 403 || status === 401) return "forbidden";
  if (status === 408) return "timeout";
  if (status >= 500) return "server";
  return "unknown";
};
