import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const downloadSecureFile = async (fileUrl: string, fileName: string) => {
  const token = useAuthStore.getState().accessToken;

  // Bersihkan parameter &token= jika masih menempel di URL
  const cleanUrl = fileUrl.split("&token=")[0];

  try {
    const response = await axios.get(cleanUrl, {
      headers: {
        // [UPDATE DI SINI] Menggunakan custom header untuk bypass Nginx
        "X-Palma-Auth": `Bearer ${token}`,
      },
      responseType: "blob",
    });

    // ✅ PENTING: Cegah download jika response ternyata adalah HTML (React Fallback) atau JSON (Pesan Error Backend)
    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("text/html") || contentType.includes("application/json")) {
      throw new Error("File gagal diunduh: Server mengembalikan HTML/JSON alih-alih file dokumen.");
    }

    const blob = new Blob([response.data], {
      type: contentType || "application/pdf",
    });

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = blobUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    
    link.click();
    
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download Error:", error);
    throw error;
  }
};