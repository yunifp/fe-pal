import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, ArrowRight, FileText, Users } from "lucide-react";
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

export const getKabkotaColumns = (
  onSelect: (kode: string, nama: string) => void,
  skMap: Record<string, ISkKabkota[]>,
  baseFileUrl: string,
  countMap: Record<string, number>,
  baMap: Record<string, IBaKabkota[]> = {},
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
      const count = countMap[kode] ?? 0;

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
    id: "sk",
    header: "SK",
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
                <a
                  href={`${baseFileUrl}/uploads/persyaratan/${latest.filename}`}
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

          {skList.length > 1 && (
            <span className="text-xs text-gray-400">+{skList.length - 1}</span>
          )}
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
                <a
                  href={`${baseFileUrl}/uploads/persyaratan/${latest.filename}`}
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

          {baList.length > 1 && (
            <span className="text-xs text-gray-400">+{baList.length - 1}</span>
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
