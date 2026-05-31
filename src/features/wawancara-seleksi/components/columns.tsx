/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getWawancaraColumns = (
  pageIndex: number, 
  pageSize: number,
  onUpdateStatus: (id: number, value: string) => void,
  showActionColumn: boolean
): ColumnDef<any>[] => {
  const baseColumns: ColumnDef<any>[] = [
    { 
      id: "no", 
      header: "No", 
      cell: ({ row }) => <span className="text-slate-500">{pageIndex * pageSize + row.index + 1}</span> 
    },
    { 
      accessorKey: "nama_lengkap", 
      header: "Nama Lengkap",
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.original.nama_lengkap}</span>
    },
    { 
      accessorKey: "nik", 
      header: "NIK",
      cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.nik}</span>
    },
    { 
      accessorKey: "kode_pendaftaran", 
      header: "Kode Pendaftaran",
      cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.kode_pendaftaran}</span> 
    },
    { accessorKey: "jalur", header: "Jalur" },
    { 
      accessorKey: "nama_kluster", 
      header: "Kluster",
      cell: ({ row }) => {
        const kluster = row.original.nama_kluster;
        return (
          <Badge 
            variant={kluster === "Afirmasi" ? "destructive" : "secondary"}
            className={kluster === "Afirmasi" ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border-none shadow-none" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-none"}
          >
            {kluster || "-"}
          </Badge>
        );
      }
    }
  ];

  if (showActionColumn) {
    baseColumns.push({ 
      accessorKey: "status_wawancara", 
      header: "Status Wawancara dan Seleksi",
      cell: ({ row }) => {
        const idTrx = row.original.id_trx_beasiswa;
        const status = row.original.status_wawancara || "";
        
        return (
          <select
            value={status}
            onChange={(e) => onUpdateStatus(idTrx, e.target.value)}
            className={`border rounded-full px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500/50 transition-all cursor-pointer w-[170px] appearance-none ${
              status === "Rekomendasi" ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" :
              status === "Tidak Rekomendasi" ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" :
              "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.5rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
              paddingRight: `2.5rem`
            }}
          >
            <option value="" disabled>Pilih Status</option>
            <option value="Rekomendasi">Rekomendasi</option>
            <option value="Tidak Rekomendasi">Tidak Rekomendasi</option>
          </select>
        );
      }
    });
  }

  return baseColumns;
};