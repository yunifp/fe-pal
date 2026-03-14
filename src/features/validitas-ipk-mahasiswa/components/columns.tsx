import type { ColumnDef } from "@tanstack/react-table";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";
import type { IValiditasIpkMahasiswa } from "@/types/validitasIpkMahasiswa";

export const getColumns = (): ColumnDef<IValiditasIpkMahasiswa>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "no_pks",
    header: "Nomor PKS",
  },
  {
    header: "Semester",
    cell: ({ row }) => "Semester " + row.original.semester,
  },
  {
    accessorKey: "created_by",
    header: "Dibuat Oleh",
  },
  {
    header: "Dibuat Pada",
    cell: ({ row }) => formatTanggalJamIndo(row.original.created_at),
  },
  {
    accessorKey: "isi_pernyataan",
    header: "Isi Pernyataan",
  },
];
