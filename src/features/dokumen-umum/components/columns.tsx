import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import type { IDokumenUmum } from "@/types/dokumenUmum";

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: IDokumenUmum) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<IDokumenUmum>[] => [
  {
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "persyaratan",
    header: "Nama Dokumen",
    cell: ({ row }) => (
      // Tambahkan styling div ini agar teks mau turun ke bawah / wrapping
      <div className="font-medium text-gray-800 whitespace-normal break-words min-w-[200px] max-w-[400px] md:max-w-[500px]">
        {row.original.persyaratan}
      </div>
    ),
  },
  {
    accessorKey: "status_aktif",
    header: "Status Aktif",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.status_aktif === "Y" ? "Ya" : "Tidak"}
      </span>
    ),
  },
  {
    accessorKey: "is_required",
    header: "Wajib Isi",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.is_required === "Y" ? "Ya" : "Tidak"}
      </span>
    ),
  },
  {
    accessorKey: "valid_type",
    header: "Type File",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words max-w-[150px]">
        {row.original.valid_type}
      </div>
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
            onClick={() => onDelete(data.id, data.persyaratan)}
          >
            <Trash className="w-4 h-4 mr-1" /> Hapus
          </Button>
        </div>
      );
    },
  },
];