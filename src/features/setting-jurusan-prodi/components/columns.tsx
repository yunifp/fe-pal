import type { ColumnDef } from "@tanstack/react-table";
import type { IProgramStudi } from "@/types/programStudi";
import { Checkbox } from "@/components/ui/checkbox";

export const getColumns = (
  onToggleMapping: (idPt: number, idProdi: number, currentStatus: boolean) => void
): ColumnDef<IProgramStudi>[] => [
  { id: "no", header: "No", cell: ({ row }) => row.index + 1 },
  { 
    id: "nama_pt", 
    header: "Perguruan Tinggi", 
    cell: ({ row }) => row.original.RefPerguruanTinggi?.nama_pt ?? "-" 
  },
  { accessorKey: "jenjang", header: "Jenjang" },
  { accessorKey: "nama_prodi", header: "Nama Prodi" },
  {
    id: "aksi",
    header: "Aksi (Mapping)",
    cell: ({ row }) => {
      // Pastikan status mapping terbaca boolean
      const isMapped = !!row.original.is_mapped;
      
      return (
        <div className="flex justify-center items-center h-full">
          <Checkbox 
            checked={isMapped}
            onCheckedChange={() => onToggleMapping(row.original.id_pt, row.original.id_prodi, isMapped)}
            className="w-5 h-5"
          />
        </div>
      );
    },
  },
];