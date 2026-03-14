import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, ArrowRight, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export const getKabkotaColumns = (
  onSelect: (kode: string, nama: string) => void,
  skMap: Record<string, ISkKabkota[]>, // key = kode_kab
  baseFileUrl: string,
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
    accessorKey: "kode_kab",
    header: "Kode",
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm font-mono text-muted-foreground">
        {getValue<number>()}
      </span>
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
    id: "sk",
    header: "Surat Keputusan",
    cell: ({ row }) => {
      const kode = String(row.original.kode_kab);
      const skList = skMap[kode] ?? [];

      if (skList.length === 0) {
        return (
          <span className="text-xs text-gray-400 italic">Belum ada SK</span>
        );
      }

      // Tampilkan SK terbaru
      const latest = skList[0];
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs text-gray-600 truncate max-w-[140px]">
              {latest.filename}
            </span>
          </div>

          <a
            href={`${baseFileUrl}/uploads/persyaratan/${latest.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Lihat SK"
            onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {skList.length > 1 && (
            <span className="text-xs text-gray-400">+{skList.length - 1}</span>
          )}
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
