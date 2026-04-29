/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table"; 
import type { ILaporanPendaftar } from "@/types/laporanPendaftar"; 
import { Check } from "lucide-react"; // WAJIB IMPORT INI

// === KOLOM DEFAULT (UNTUK PENDAFTAR BIASA) ===
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

// === KOLOM KHUSUS UNTUK DATA CEKAL (TIPE LAPORAN = 3) ===
export const getCekalColumns = (
  page: number,
  limit: number
): ColumnDef<any>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 60,
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.nama || "-"}</span>,
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.nik}</span>,
  },
  {
    accessorKey: "tahun",
    header: "Tahun",
    cell: ({ row }) => <span className="text-slate-600">{row.original.tahun || "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span className="text-slate-600">{row.original.keterangan || "-"}</span>,
  },
  {
    accessorKey: "is_aktif",
    header: "Aktif Cekal",
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.is_aktif === "Y" && (
          <Check className="w-5 h-5 text-emerald-600 font-bold" />
        )}
      </div>
    ),
    size: 100,
  },
];