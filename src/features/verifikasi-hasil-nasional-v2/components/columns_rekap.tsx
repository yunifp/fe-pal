import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { RekapProvinsiRow } from "@/types/beasiswa";

export const columnsRekap: ColumnDef<RekapProvinsiRow>[] = [
  {
    header: "No",
    cell: (info) => info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "nama_dinas_provinsi",
    header: "Provinsi",
  },
  {
    accessorKey: "jumlah_pendaftar",
    header: "Jumlah Pendaftar",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const kodeProvinsi = row.original.kode_dinas_provinsi;
      return (
        <Link to={`/verifikasi-nasional-v2/${kodeProvinsi}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Detail
          </Button>
        </Link>
      );
    },
  },
];