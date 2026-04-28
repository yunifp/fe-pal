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

// ✅ Helper function cerdas untuk memperbaiki dan merapikan URL Dokumen S3
const getDocUrl = (filename: string) => {
  if (!filename) return "#";
  
  // Jika backend sudah mengirim full URL (diawali http/https), langsung gunakan
  if (filename.startsWith("http")) {
    return filename;
  }
  
  // Jika backend hanya mengirim path S3 (contoh: 2026/ADMIN_...), gabungkan dengan Bucket URL S3 Anda
  return `https://nos.wjv-1.neo.id/palma-upload-bucket-testing/${filename}`;
};

export const getKabkotaColumns = (
  onSelect: (kode: string, nama: string) => void,
  skMap: Record<string, ISkKabkota[]>,
  // baseFileUrl: string,
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
      
      // ✅ PERBAIKAN 1: Menggunakan statusVerifikasiMap.total sebagai fallback yang akurat 
      // jika countMap tidak terisi dari backend
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

      // Mengambil file urutan paling pertama (terbaru)
      const latest = skList[0];

      return (
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={getDocUrl(latest.filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <FileText className="w-4 h-4 text-primary" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Surat Keputusan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* ✅ PERBAIKAN 2: Indikator + jumlah sisa dokumen dihilangkan */}
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

      // Mengambil file urutan paling pertama (terbaru)
      const latest = baList[0];

      return (
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={getDocUrl(latest.filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <FileText className="w-4 h-4 text-primary" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Berita Acara</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* ✅ PERBAIKAN 2: Indikator + jumlah sisa dokumen dihilangkan */}
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