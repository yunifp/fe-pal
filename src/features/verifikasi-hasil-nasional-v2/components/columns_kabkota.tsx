import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

// ✅ Tambahkan interface agar kita tidak menggunakan 'any' di ColumnDef
export interface RekapKabkotaRow {
  kode_dinas_kabkota: string;
  nama_dinas_kabkota: string;
  jumlah_pendaftar: number;
}

export const getColumnsKabkota = (
  onViewDokumen: (kodeKabkota: string, namaKabkota: string) => void,
  onViewDetail: (kodeKabkota: string, namaKabkota: string) => void
): ColumnDef<RekapKabkotaRow>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
    size: 50,
  },
  {
    accessorKey: "nama_dinas_kabkota",
    header: "Kabupaten/Kota",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900">
        {row.original.nama_dinas_kabkota}
      </span>
    ),
  },
  {
    accessorKey: "jumlah_pendaftar",
    header: "Jumlah Pendaftar",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm min-w-[3rem]">
        {row.original.jumlah_pendaftar || 0}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const kodeKabkota = row.original.kode_dinas_kabkota;
      const namaKabkota = row.original.nama_dinas_kabkota;
      
      return (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDokumen(kodeKabkota, namaKabkota)}
            className="h-9 px-3 rounded-xl font-semibold border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors shadow-none"
          >
            <FileText className="w-3.5 h-3.5 mr-2" />
            Dokumen BA & SK
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetail(kodeKabkota, namaKabkota)}
            className="h-9 px-4 rounded-xl font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shadow-none"
          >
            <Eye className="w-3.5 h-3.5 mr-2" />
            Detail Pendaftar
          </Button>
        </div>
      );
    },
  },
];