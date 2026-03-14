import type { ColumnDef } from "@tanstack/react-table";
import type { IValiditasKeaktifanMahasiswa } from "@/types/validitasKeaktifanMahasiswa";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";

export const getColumns = (): ColumnDef<IValiditasKeaktifanMahasiswa>[] => [
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
    accessorKey: "tahun",
    header: "Tahun",
  },
  {
    accessorKey: "bulan",
    header: "Bulan",
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
