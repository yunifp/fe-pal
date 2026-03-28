/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getWawancaraColumns = (pageIndex: number, pageSize: number): ColumnDef<any>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => pageIndex * pageSize + row.index + 1 
  },
  { 
    accessorKey: "nama_lengkap", 
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-semibold">{row.original.nama_lengkap}</span>
  },
  { accessorKey: "nik", header: "NIK" },
  { accessorKey: "kode_pendaftaran", header: "Kode Pendaftaran" },
  { accessorKey: "jalur", header: "Jalur" },
  { 
    accessorKey: "nama_kluster", 
    header: "Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return (
        <Badge variant={kluster === "Afirmasi" ? "destructive" : "default"}>
          {kluster || "-"}
        </Badge>
      );
    }
  },
  { 
    accessorKey: "nilai_temp", 
    header: "Nilai Wawancara",
    cell: ({ row }) => {
      const nilai = row.original.nilai_temp;
      return nilai ? (
        <span className="font-bold text-green-600">{nilai}</span>
      ) : (
        <span className="italic text-gray-400 text-sm">Belum dinilai</span>
      );
    }
  },
];