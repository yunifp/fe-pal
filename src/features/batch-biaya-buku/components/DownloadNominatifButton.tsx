import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { biayaBukuService } from "@/services/biayaBukuService";

interface Props {
  idBatch: number;
}

export const DownloadNominatifButton = ({ idBatch }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const response =
        await biayaBukuService.generateNominatifGabungan(idBatch);

      const blob = new Blob([response.data], { type: "application/pdf" });

      const contentDisposition = response.headers["content-disposition"];

      let filename = "daftar-nominatif.pdf";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+\.pdf)"?/i);
        if (match?.[1]) {
          filename = match[1].trim(); // pastikan tidak ada spasi di awal/akhir
        }
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
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
