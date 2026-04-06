import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import type { IJalurMaster } from "@/types/jalurMaster";

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: IJalurMaster) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<IJalurMaster>[] => [
  {
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "jalur",
    header: "Nama Jalur",
    cell: ({ row }) => <span className="font-medium text-gray-800">{row.original.jalur}</span>,
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(data)}>
            <Edit className="w-4 h-4 mr-1 text-amber-600" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(data.id, data.jalur)}
          >
            <Trash className="w-4 h-4 mr-1" /> Hapus
          </Button>
        </div>
      );
    },
  },
];