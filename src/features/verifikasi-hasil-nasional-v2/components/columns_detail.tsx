import { Check, Minus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "./ActionCell";
import type { DetailPendaftarRow } from "@/types/beasiswa";

export const getColumnsDetail = (
  onUbahKluster: (id: number, kluster: string) => void
): ColumnDef<DetailPendaftarRow>[] => [
  {
    header: "No",
    cell: (info) => info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
  },
  {
    id: "is_3t",
    header: "3T",
    cell: ({ row }) =>
      row.original.is_3t ? (
        <Check className="text-green-600 w-5 h-5 mx-auto" />
      ) : (
        <Minus className="text-gray-400 w-5 h-5 mx-auto" />
      ),
  },
  {
    id: "is_sktm",
    header: "Dokumen SKTM",
    cell: ({ row }) =>
      row.original.is_sktm ? (
        <Check className="text-green-600 w-5 h-5 mx-auto" />
      ) : (
        <Minus className="text-gray-400 w-5 h-5 mx-auto" />
      ),
  },
  {
    accessorKey: "nama_kluster",
    header: "Status Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return kluster ? (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            kluster === "Afirmasi"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {kluster}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} onUbahKluster={onUbahKluster} />,
  },
];