import { Check, Minus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "./ActionCell";
import type { DetailPendaftarRow } from "@/types/beasiswa";

export const getColumnsDetail = (
  onUbahKluster: (id: number, kluster: string) => void
): ColumnDef<DetailPendaftarRow>[] => [
  {
    header: "No",
    cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
    size: 50,
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_lengkap}</span>
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.nik}</span>
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
    cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.kode_pendaftaran}</span>
  },
  {
    accessorKey: "nama_dinas_kabkota",
    header: "Kabupaten/Kota",
    cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.nama_dinas_kabkota || "-"}</span>,
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
    cell: ({ row }) => <span className="text-slate-600">{row.original.jalur}</span>
  },
  {
    id: "is_3t",
    header: "3T",
    cell: ({ row }) =>
      row.original.is_3t ? (
        <div className="flex justify-center">
          <div className="p-1 bg-emerald-100 rounded-full w-fit">
            <Check className="text-emerald-600 w-4 h-4 stroke-[3]" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Minus className="text-slate-300 w-5 h-5" />
        </div>
      ),
  },
  {
    id: "is_sktm",
    header: "Dokumen SKTM",
    cell: ({ row }) =>
      row.original.is_sktm ? (
        <div className="flex justify-center">
          <div className="p-1 bg-emerald-100 rounded-full w-fit">
            <Check className="text-emerald-600 w-4 h-4 stroke-[3]" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Minus className="text-slate-300 w-5 h-5" />
        </div>
      ),
  },
  {
    accessorKey: "nama_kluster",
    header: "Status Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return kluster ? (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border ${
            kluster === "Afirmasi"
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}
        >
          {kluster}
        </span>
      ) : (
        <span className="text-slate-400">-</span>
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} onUbahKluster={onUbahKluster} />,
  },
];