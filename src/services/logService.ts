import { LOG_SERVICE_BASE_URL } from "@/constants/api";
import axios from "axios";

export const logService = {
  logActivity: async (payload: any) => {
    try {
      // kirim log ke backend log service
      await axios.post(`${LOG_SERVICE_BASE_URL}/log-activity`, payload);
    } catch (err) {
      console.error("Failed to send log", err);
    }
  },
};
