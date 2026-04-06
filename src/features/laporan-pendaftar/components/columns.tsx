import type { ColumnDef } from "@tanstack/react-table"; // Import ini wajib
import type { ILaporanPendaftar } from "@/types/laporanPendaftar"; // Import ini juga wajib

export const getColumns = (
  page: number,
  limit: number
): ColumnDef<ILaporanPendaftar>[] => [
  {
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Peserta",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-700">
        {row.original.kode_pendaftaran || "-"}
      </span>
    ),
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {row.original.nama_lengkap || "-"}
      </span>
    ),
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => row.original.nik || "-",
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
    cell: ({ row }) => <span>{row.original.jalur || "-"}</span>,
  },
];