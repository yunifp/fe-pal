import type { ColumnDef } from "@tanstack/react-table";
import type { IProgramStudi } from "@/types/programStudi";
import { Checkbox } from "@/components/ui/checkbox";

export const getColumns = (
  onToggleMapping: (idPt: number, idProdi: number, currentStatus: boolean) => void,
  isViewMode: boolean = false 
): ColumnDef<IProgramStudi>[] => {
  const baseColumns: ColumnDef<IProgramStudi>[] = [
    { 
      id: "no", 
      header: "No", 
      cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span>,
      size: 60,
    },
    { 
      id: "nama_pt", 
      header: "Perguruan Tinggi", 
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.RefPerguruanTinggi?.nama_pt ?? "-"}</span> 
    },
    { 
      accessorKey: "jenjang", 
      header: "Jenjang",
      cell: ({ row }) => <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs uppercase">{row.original.jenjang}</span>
    },
    { 
      accessorKey: "nama_prodi", 
      header: "Nama Program Studi",
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_prodi}</span>
    },
  ];

  if (!isViewMode) {
    baseColumns.push({
      id: "aksi",
      header: "Status Hubung",
      cell: ({ row }) => {
        const isMapped = !!row.original.is_mapped;
        
        return (
          <div className="flex justify-center items-center h-full">
            <Checkbox 
              checked={isMapped}
              onCheckedChange={() => onToggleMapping(row.original.id_pt, row.original.id_prodi, isMapped)}
              className="w-5 h-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 transition-all shadow-sm"
            />
          </div>
        );
      },
    });
  }

  return baseColumns;
};