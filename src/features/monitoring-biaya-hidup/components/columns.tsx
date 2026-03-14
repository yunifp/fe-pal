import type { ColumnDef } from "@tanstack/react-table";

import type { IMonitoringPengajuan } from "@/types/biayaHidup";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (): ColumnDef<IMonitoringPengajuan>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nama",
    header: "Lembaga Pendidikan",
  },
  {
    accessorKey: "total_pks",
    header: "Total PKS",
  },
  {
    accessorKey: "pks_sudah_diajukan",
    header: "PKS Sudah Diajukan",
  },
  {
    accessorKey: "pks_belum_diajukan",
    header: "PKS Belum Diajukan",
  },
];
