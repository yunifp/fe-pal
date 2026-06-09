/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Info, 
  Download, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Award, 
  FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";

interface AlertSudahSubmitProps {
  idTrxBeasiswa: number;
  idFlow: number;
}

const AlertSudahSubmit = ({ idTrxBeasiswa, idFlow }: AlertSudahSubmitProps) => {
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

  // Logic dinamis untuk warna, tulisan, dan icon berdasarkan id_flow
  const getStatusConfig = (flow: number) => {
    // 1. Kondisi Baru Pendaftaran (Flow: 0, 1)
    if ([0, 1].includes(flow)) {
      return {
        label: "Pendaftaran Beasiswa",
        message: "Data pendaftaran Anda telah berhasil dikirim dan menunggu antrean untuk diverifikasi.",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300",
        iconColor: "text-blue-600",
        textColor: "text-blue-900",
        descColor: "text-blue-800",
        badgeColor: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
        Icon: Info,
      };
    }

    // 2. Kondisi Sedang Dalam Seleksi Administrasi Awal (Flow: 2, 4, 5, 8)
    if ([2, 4, 5, 8].includes(flow)) {
      return {
        label: "Seleksi Administrasi",
        message: "Berkas Anda sedang dalam tahap seleksi administrasi. Mohon pantau status pengajuan Anda secara berkala.",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-300",
        iconColor: "text-amber-600",
        textColor: "text-amber-900",
        descColor: "text-amber-800",
        badgeColor: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
        Icon: Clock,
      };
    }

    // 3. Kondisi Tidak Lulus (Flow: 3)
    if (flow === 3) {
      return {
        label: "Tidak Lulus Administrasi",
        message: "Mohon maaf, permohonan beasiswa Anda tidak lulus tahap administrasi.",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        iconColor: "text-red-600",
        textColor: "text-red-900",
        descColor: "text-red-800",
        badgeColor: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
        Icon: XCircle,
      };
    }

    // 4. Kondisi Verifikasi Dinas (Flow: 6, 7)
    if ([6, 7].includes(flow)) {
      return {
        label: "Verifikasi Dinas",
        message: "Berkas Anda saat ini sedang dalam tahap Verifikasi Dinas. Mohon pantau terus perkembangannya.",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-300",
        iconColor: "text-indigo-600",
        textColor: "text-indigo-900",
        descColor: "text-indigo-800",
        badgeColor: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200",
        Icon: FileText,
      };
    }

    // 5. Kondisi Analisa Rasio (Flow: 9)
    if (flow === 9) {
      return {
        label: "Analisa Rasio",
        message: "Tahap selanjutnya adalah Analisa Rasio. Berkas Anda sedang dievaluasi secara komprehensif pada tahap ini.",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300",
        iconColor: "text-purple-600",
        textColor: "text-purple-900",
        descColor: "text-purple-800",
        badgeColor: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
        Icon: Info,
      };
    }

    // 6. Kondisi Tes Seleksi (Flow: 10, 11)
    if ([10, 11].includes(flow)) {
      return {
        label: "Tes Seleksi",
        message: "Anda telah memasuki tahap Tes Seleksi. Persiapkan diri Anda dan cek jadwal tes secara berkala.",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
        iconColor: "text-orange-600",
        textColor: "text-orange-900",
        descColor: "text-orange-800",
        badgeColor: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200",
        Icon: FileText,
      };
    }

    // 7. Kondisi Proses Seleksi Oleh BPDP (Flow: 12)
    if (flow === 12) {
      return {
        label: "Proses Seleksi Oleh BPDP",
        message: "Data pengajuan Anda saat ini sedang dalam Proses Seleksi final oleh pihak BPDP. Harap menunggu pengumuman.",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-300",
        iconColor: "text-teal-600",
        textColor: "text-teal-900",
        descColor: "text-teal-800",
        badgeColor: "bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200",
        Icon: Clock,
      };
    }

    // 8. Kondisi Sisa Lulus Administrasi/Menunggu Tahap Lain (Flow: 13)
    if (flow === 13) {
      return {
        label: "Lulus Administrasi",
        message: "Selamat, Anda telah Lulus Administrasi! mohon selalu cek secara berkala pada akun anda dan menunggu informasi selanjutnya.",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-300",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-900",
        descColor: "text-emerald-800",
        badgeColor: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
        Icon: CheckCircle2,
      };
    }

    // 9. Kondisi Lulus Seleksi Akhir Beasiswa (Flow: 14)
    if (flow === 14) {
      return {
        label: "Lulus Penerimaan Beasiswa",
        message: "SELAMAT! Anda telah dinyatakan LULUS sebagai penerima beasiswa.",
        bgColor: "bg-green-50",
        borderColor: "border-green-400",
        iconColor: "text-green-600",
        textColor: "text-green-900",
        descColor: "text-green-800",
        badgeColor: "bg-green-500 text-white hover:bg-green-600 border-green-600",
        Icon: Award,
      };
    }

    // Default Fallback
    return {
      label: "Status Tidak Diketahui",
      message: "Status pengajuan Anda saat ini sedang diproses.",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      iconColor: "text-gray-600",
      textColor: "text-gray-900",
      descColor: "text-gray-700",
      badgeColor: "bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300",
      Icon: Info,
    };
  };

  const status = getStatusConfig(idFlow);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* --- CARD 1: Informasi Default & Tombol Download --- */}
      <Alert className="border-slate-200 text-slate-800 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex gap-3 items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <AlertTitle className="font-semibold text-slate-900">
              Informasi Pengajuan
            </AlertTitle>
            <AlertDescription className="text-slate-600 mt-1">
              Anda telah men-submit data pada beasiswa ini. Mohon pantau status pengajuan Anda.
            </AlertDescription>
          </div>
        </div>
        
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant="outline"
          className="shrink-0 bg-white hover:bg-blue-50 text-blue-700 border-blue-200 w-full md:w-auto transition-colors"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isDownloading ? "Mengunduh..." : "Unduh Bukti Pendaftaran"}
        </Button>
      </Alert>

      {/* --- CARD 2: Indikator Status Dinamis --- */}
      <Alert className={`border ${status.borderColor} ${status.bgColor} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-all duration-300`}>
        <div className="flex gap-3 items-start">
          <status.Icon className={`h-6 w-6 ${status.iconColor} mt-0.5 shrink-0`} />
          <div>
            <AlertTitle className={`font-bold ${status.textColor} text-base`}>
              Status Pendaftaran
            </AlertTitle>
            <AlertDescription className={`${status.descColor} font-medium mt-1 leading-relaxed`}>
              {status.message}
            </AlertDescription>
          </div>
        </div>
        
        <Badge className={`${status.badgeColor} border shadow-sm text-sm px-4 py-1.5 shrink-0 whitespace-nowrap`}>
          {status.label}
        </Badge>
      </Alert>
    </div>
  );
};

export default AlertSudahSubmit;