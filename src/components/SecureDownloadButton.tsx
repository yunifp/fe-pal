/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";

interface SecureDownloadProps {
  url: string | null | undefined;
  filename?: string;
  label?: string;
}

export const SecureDownloadButton = ({ 
  url, 
  filename = "Surat_Penunjukan", 
  label = "Download Dokumen" 
}: SecureDownloadProps) => {
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!url || !accessToken) return;

    try {
      setIsLoading(true);
      const cleanUrl = url.split("&token=")[0];

      const response = await axios.get(cleanUrl, {
        headers: {
          // [UPDATE DI SINI] Menggunakan custom header untuk bypass Nginx
          "X-Palma-Auth": `Bearer ${accessToken}`,
        },
        responseType: "blob", // Tarik sebagai biner
      });

      // PENTING: Cek apakah response sebenarnya adalah JSON Error (bukan Blob PDF/Image)
      if (response.data.type === "application/json" || response.data.type.includes("text")) {
         const textError = await response.data.text();
         throw new Error(textError || "Gagal mengunduh file");
      }

      // Deteksi ekstensi file dari Content-Type backend agar tidak salah format
      const contentType = response.headers["content-type"];
      let extension = ".pdf";
      if (contentType?.includes("jpeg") || contentType?.includes("jpg")) extension = ".jpg";
      else if (contentType?.includes("png")) extension = ".png";

      // Hapus ekstensi manual dari props filename jika ada, lalu pasang ekstensi yang benar
      const baseFilename = filename.replace(/\.[^/.]+$/, "");
      const finalFilename = `${baseFilename}${extension}`;

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", finalFilename);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Download Error:", error);
      alert(error.message || "Akses ditolak atau dokumen tidak ditemukan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!url) return <span className="text-gray-400 italic">Tidak ada dokumen</span>;

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isLoading} 
      variant="outline"
      size="sm"
    >
      {isLoading ? "Memproses..." : label}
    </Button>
  );
};