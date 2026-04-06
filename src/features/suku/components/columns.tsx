import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import type { ISukuMaster } from "@/types/suku";

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: ISukuMaster) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<ISukuMaster>[] => [
  {
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "nama_suku",
    header: "Nama Suku",
    cell: ({ row }) => (
      <div className="font-medium text-gray-800 whitespace-normal break-words min-w-[200px] max-w-[400px]">
        {row.original.nama_suku}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status Aktif",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.is_active === "Y" ? "Ya" : "Tidak"}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button variant="outline" size="sm" onClick={() => onEdit(data)}>
            <Edit className="w-4 h-4 mr-1 text-amber-600" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(data.id, data.nama_suku)}
          >
            <Trash className="w-4 h-4 mr-1" /> Hapus
          </Button>
        </div>
      );
    },
  },
];