import axios from "axios";
import { useAuthStore } from "../../stores/authStore";

export const downloadSecureFile = async (fileUrl: string, fileName: string) => {
  const token = useAuthStore.getState().accessToken;

  const response = await axios.get(fileUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  
  link.click();
  
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};