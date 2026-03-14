import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { biayaHidupService } from "@/services/biayaHidupService";

interface Props {
  idBatch: number;
}

export const DownloadRekapButton = ({ idBatch }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const response = await biayaHidupService.generateRekap(idBatch);

      // pastikan ini Blob
      const blob = new Blob([response.data], { type: "application/pdf" });

      // ambil filename dari header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "rekap-biaya-hidup.pdf";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+\.pdf)"?/i);
        if (match?.[1]) {
          filename = match[1].trim();
        }
      }

      // buat URL object
      const url = window.URL.createObjectURL(blob);

      // ⚡ Download otomatis langsung tanpa preview
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link); // untuk memastikan browser trigger click
      link.click();
      link.remove();

      // revoke URL setelah 5 detik
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (error) {
      console.error("Gagal download file", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Lihat File
        </>
      )}
    </Button>
  );
};
