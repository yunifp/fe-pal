/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getHasilPerankinganColumns = (pageIndex: number, pageSize: number): ColumnDef<any>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => <span className="text-slate-500">{pageIndex * pageSize + row.index + 1}</span> 
  },
  { 
    accessorKey: "nama_lengkap", 
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_lengkap}</span>
  },
  { 
    accessorKey: "nama_kluster", 
    header: "Kluster",
    cell: ({ row }) => {
      const kl = row.original.nama_kluster;
      return (
        <Badge 
          variant={kl === "Afirmasi" ? "destructive" : "secondary"}
          className={kl === "Afirmasi" ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-none shadow-none" : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-none"}
        >
          {kl || "-"}
        </Badge>
      );
    }
  },
  { 
    accessorKey: "status_wawancara", 
    header: "Status Wawancara",
    cell: ({ row }) => {
      const status = row.original.status_wawancara;
      return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border ${
          status === 'Rekomendasi' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
          status === 'Tidak Rekomendasi' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
          'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          {status || "-"}
        </span>
      );
    }
  },
  { 
    accessorKey: "id_pt_final", 
    header: "ID PT",
    cell: ({ row }) => <span className="text-slate-600 font-mono">{row.original.id_pt_final || "-"}</span>
  },
  { 
    accessorKey: "pt_final", 
    header: "PT Final",
    cell: ({ row }) => <span className="text-teal-700 font-bold">{row.original.pt_final || "-"}</span>
  },
  { 
    accessorKey: "id_prodi_final", 
    header: "ID Prodi",
    cell: ({ row }) => <span className="text-slate-600 font-mono">{row.original.id_prodi_final || "-"}</span>
  },
  { 
    accessorKey: "prodi_final", 
    header: "Prodi Final",
    cell: ({ row }) => <span className="text-emerald-700 font-semibold">{row.original.prodi_final || "-"}</span>
  },
];