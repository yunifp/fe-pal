import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { RekapProvinsiRow } from "@/types/beasiswa";

export const getColumnsRekap = (
  onViewDokumen: (kodeProv: string, namaProv: string) => void
): ColumnDef<RekapProvinsiRow>[] => [
  {
    header: "No",
    cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
    size: 50,
  },
  {
    accessorKey: "nama_dinas_provinsi",
    header: "Provinsi",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_dinas_provinsi}</span>,
  },
  {
    accessorKey: "jumlah_pendaftar",
    header: "Jumlah Pendaftar",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm min-w-[3rem]">
        {row.original.jumlah_pendaftar}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const kodeProvinsi = row.original.kode_dinas_provinsi;
      const namaProvinsi = row.original.nama_dinas_provinsi;
      return (
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDokumen(kodeProvinsi, namaProvinsi)}
            className="h-9 px-3 rounded-xl font-semibold border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors shadow-none"
          >
            <FileText className="w-3.5 h-3.5 mr-2" />
            Dokumen
          </Button>
          <Link to={`/verifikasi-nasional-v2/${kodeProvinsi}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-4 rounded-xl font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shadow-none"
            >
              <Eye className="w-3.5 h-3.5 mr-2" />
              Detail
            </Button>
          </Link>
        </div>
      );
    },
  },
];