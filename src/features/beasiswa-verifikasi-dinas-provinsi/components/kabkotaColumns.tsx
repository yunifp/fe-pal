import type { ColumnDef } from "@tanstack/react-table";
import {
  MapPin,
  ArrowRight,
  FileText,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { downloadSecureFile } from "@/utils/fileHelper";
import { toast } from "sonner";

export interface IKabkotaRow {
  kode_kab: number;
  nama_wilayah: string;
}

export interface ISkKabkota {
  id: number;
  filename: string;
  uploaded_by: string;
  created_at: string;
  kode_dinas_kabkota: string;
}

export interface IBaKabkota {
  id: number;
  filename: string;
  uploaded_by: string;
  created_at: string;
  kode_dinas_kabkota: string;
}

// ✅ Helper untuk membuat URL proxy lokal yang aman via JWT
const getSecureProxyUrl = (filename: string, folder: string) => {
  if (!filename) return "";
  
  // Jika filename dari database kebetulan sudah berupa URL proxy lengkap, langsung gunakan
  if (filename.includes("/api/files/view")) {
    return filename;
  }

  let fileKey = filename;

  // Bersihkan jika backend mengirimkan URL S3 utuh (http/https)
  if (filename.startsWith("http")) {
    try {
      const urlObj = new URL(filename);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // Buang nama bucket jika ada di awal path S3
      if (pathParts[0] === "palma-upload-bucket-testing" || pathParts[0] === "palma-upload-bucket") {
        pathParts.shift();
      }
      fileKey = pathParts.join('/');
    } catch (e) {
      // Abaikan error parsing
    }
  }
  
  // ✅ PERBAIKAN: Gunakan VITE_AUTH_SERVICE_BASE_URL karena endpoint /api/files/view ada di Auth Service
  const authUrl = import.meta.env.VITE_AUTH_SERVICE_BASE_URL || "http://localhost:3001/api/auth";
  
  // Hilangkan "/auth" di akhir URL untuk mendapatkan "http://localhost:3001/api"
  const baseUrl = authUrl.replace(/\/auth\/?$/, ""); 
  
  const encodedFilename = encodeURIComponent(fileKey);
  const encodedFolder = encodeURIComponent(folder);
  
  // Hasil akhir: http://localhost:3001/api/files/view?folder=...&file=...
  return `${baseUrl}/files/view?folder=${encodedFolder}&file=${encodedFilename}`;
};

export const getKabkotaColumns = (
  onSelect: (kode: string, nama: string) => void,
  skMap: Record<string, ISkKabkota[]>,
  countMap: Record<string, number>,
  baMap: Record<string, IBaKabkota[]> = {},
  statusVerifikasiMap: Record<
    string,
    { total: number; sudah_tag: number; selesai: boolean }
  > = {}, 
): ColumnDef<IKabkotaRow>[] => [
  {
    id: "no",
    header: "No",
    size: 60,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "nama_wilayah",
    header: "Kabupaten / Kota",
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium">{getValue<string>()}</span>
      </div>
    ),
  },
  {
    id: "jumlah",
    header: "Jumlah Pendaftar",
    cell: ({ row }) => {
      const kode = String(row.original.kode_kab);
      const count = countMap[kode] || statusVerifikasiMap[kode]?.total || 0;

      return (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{count}</span>
          <span className="text-xs text-muted-foreground">pendaftar</span>
        </div>
      );
    },
  },
  {
    id: "status_verifikasi",
    header: "Status Verifikasi",
    cell: ({ row }) => {
      const kode = String(row.original.kode_kab);
      const status = statusVerifikasiMap[kode];

      if (!status || status.total === 0) {
        return <span className="text-gray-300 text-xs">—</span>;
      }

      return (
        <div className="flex items-center gap-2 min-w-[140px]">
          {status.selesai ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Selesai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <Clock className="w-3 h-3" />
              Belum Selesai
            </span>
          )}
          <span className="text-xs text-gray-500">
            {status.sudah_tag}/{status.total}
          </span>
        </div>
      );
    },
  },
  {
    id: "sk",
    header: "Surat Rekomendasi",
    cell: ({ row }) => {
      const kode = String(row.original.kode_kab);
      const skList = skMap[kode] ?? [];

      if (skList.length === 0) {
        return <span className="text-gray-300 text-xs">—</span>;
      }

      const latest = skList[0];

      return (
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      // ✅ Panggil helper dengan nama folder 'rekomtek'
                      const url = getSecureProxyUrl(latest.filename, "rekomtek");
                      
                      let ext = ".pdf";
                      try {
                        const actualFile = latest.filename.split('/').pop() || "";
                        ext = actualFile.includes('.') ? actualFile.substring(actualFile.lastIndexOf('.')) : '.pdf';
                      } catch (err) {}

                      const cleanNamaWilayah = row.original.nama_wilayah.replace(/[^a-zA-Z0-9]/g, "_");
                      const fileName = `Surat_Rekomendasi_${cleanNamaWilayah}${ext}`;

                      await downloadSecureFile(url, fileName);
                    } catch (error) {
                      toast.error("Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.");
                    }
                  }}>
                  <FileText className="w-4 h-4 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Unduh Surat Rekomendasi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "ba",
    header: "Berita Acara",
    cell: ({ row }) => {
      const kode = String(row.original.kode_kab);
      const baList = baMap[kode] ?? [];

      if (baList.length === 0) {
        return <span className="text-gray-300 text-xs">—</span>;
      }

      const latest = baList[0];

      return (
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      // ✅ Panggil helper dengan nama folder 'berita_acara'
                      const url = getSecureProxyUrl(latest.filename, "berita_acara");
                      
                      let ext = ".pdf";
                      try {
                        const actualFile = latest.filename.split('/').pop() || "";
                        ext = actualFile.includes('.') ? actualFile.substring(actualFile.lastIndexOf('.')) : '.pdf';
                      } catch (err) {}

                      const cleanNamaWilayah = row.original.nama_wilayah.replace(/[^a-zA-Z0-9]/g, "_");
                      const fileName = `Berita_Acara_${cleanNamaWilayah}${ext}`;

                      await downloadSecureFile(url, fileName);
                    } catch (error) {
                      toast.error("Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.");
                    }
                  }}>
                  <FileText className="w-4 h-4 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Unduh Berita Acara</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    size: 120,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-1.5 text-xs"
        onClick={() =>
          onSelect(String(row.original.kode_kab), row.original.nama_wilayah)
        }>
        Lihat Pendaftar
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    ),
  },
];