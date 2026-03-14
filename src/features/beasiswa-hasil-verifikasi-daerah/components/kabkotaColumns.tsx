import type { ColumnDef } from "@tanstack/react-table";
import type { IKabkotaWithCount } from "@/types/beasiswa";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export const getKabkotaColumns = (
  onSelect: (kodeKabkota: string, namaKabkota: string) => void,
): ColumnDef<IKabkotaWithCount>[] => [
  {
    accessorKey: "nama_wilayah",
    header: "Kabupaten/Kota",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.nama_wilayah}</div>;
    },
  },
  {
    accessorKey: "jumlah_pendaftar",
    header: "Jumlah Pendaftar",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
            {row.original.jumlah_pendaftar}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onSelect(
              row.original.kode_kab?.toString() ?? "",
              row.original.nama_wilayah,
            )
          }>
          Lihat Pendaftar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
