/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getHasilPerankinganColumns = (pageIndex: number, pageSize: number): ColumnDef<any>[] => [
  { 
    id: "no", header: "No", 
    cell: ({ row }) => pageIndex * pageSize + row.index + 1 
  },
  { 
    accessorKey: "nama_lengkap", header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-semibold">{row.original.nama_lengkap}</span>
  },
  { 
    accessorKey: "nama_kluster", header: "Kluster",
    cell: ({ row }) => {
      const kl = row.original.nama_kluster;
      return <Badge variant={kl === "Afirmasi" ? "destructive" : "default"}>{kl || "-"}</Badge>;
    }
  },
  { accessorKey: "nilai_temp", header: "Nilai Akhir" },
  { 
    accessorKey: "pt_final", header: "PT Final",
    cell: ({ row }) => <span className="text-blue-700 font-semibold">{row.original.pt_final}</span>
  },
  { 
    accessorKey: "prodi_final", header: "Prodi Final",
    cell: ({ row }) => <span className="text-purple-700 font-semibold">{row.original.prodi_final}</span>
  },
];