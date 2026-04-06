/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Check, Minus } from "lucide-react";
import type { IWilayahKhusus } from "@/types/wilayahKhusus";

// Komponen helper untuk merender ikon V (Ceklis) atau - (Strip)
const RenderStatusIcon = ({ isActive }: { isActive: boolean }) => {
  return isActive ? (
    <Check className="w-5 h-5 text-emerald-600 font-bold mx-auto" />
  ) : (
    <Minus className="w-5 h-5 text-gray-300 mx-auto" />
  );
};

export const getColumns = (
  onEdit: (data: IWilayahKhusus) => void,
  onReset: (id: number, nama: string) => void
): ColumnDef<IWilayahKhusus>[] => [
  {
    header: "No",
    cell: (info) => info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "nama_provinsi",
    header: "Provinsi",
  },
  {
    accessorKey: "nama_kabkota",
    header: "Kabupaten/Kota",
    cell: ({ row }) => <span className="font-medium text-gray-800">{row.original.nama_kabkota}</span>,
  },
  {
    id: "wilayah_3t",
    header: () => <div className="text-center">Wilayah 3T</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_3t} />,
  },
  {
    id: "wilayah_perbatasan",
    header: () => <div className="text-center">Wilayah Perbatasan</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_perbatasan} />,
  },
  {
    id: "wilayah_papua_nusateng",
    header: () => <div className="text-center">Papua & Nusa Tenggara</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_papua_nusateng} />,
  },
  {
    id: "is_khusus",
    header: () => <div className="text-center">Wilayah Khusus</div>,
    cell: ({ row }) => (
      <div className={row.original.is_khusus ? "bg-amber-100 p-1 rounded w-max mx-auto" : ""}>
        <RenderStatusIcon isActive={row.original.is_khusus} />
      </div>
    ),
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
            onClick={() => onReset(data.wilayah_id, data.nama_kabkota)}
            disabled={!data.is_khusus} // Hapus(reset) hanya bisa di-klik jika statusnya khusus
          >
            <Trash className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>
      );
    },
  },
];