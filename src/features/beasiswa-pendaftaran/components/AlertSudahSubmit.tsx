/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";

interface AlertSudahSubmitProps {
  idTrxBeasiswa: number;
}

const AlertSudahSubmit = ({ idTrxBeasiswa }: AlertSudahSubmitProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await beasiswaService.downloadPdfBuktiPendaftaran(idTrxBeasiswa);
      toast.success("Bukti pendaftaran berhasil diunduh.");
    } catch (error) {
      toast.error("Gagal mengunduh bukti pendaftaran. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Alert className="border-blue-500 text-blue-700 bg-blue-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
      <div className="flex gap-3 items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <AlertTitle className="font-semibold text-blue-800">Informasi</AlertTitle>
          <AlertDescription className="text-blue-700/90 mt-1">
            Anda telah men-submit data pada beasiswa ini. Mohon tunggu verifikator
            untuk memverifikasi pengajuan Anda.
          </AlertDescription>
        </div>
      </div>
      
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="outline"
        className="shrink-0 bg-white hover:bg-blue-100 text-blue-700 border-blue-300 w-full md:w-auto transition-colors"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isDownloading ? "Mengunduh..." : "Unduh Bukti Pendaftaran"}
      </Button>
    </Alert>
  );
};

export default AlertSudahSubmit;