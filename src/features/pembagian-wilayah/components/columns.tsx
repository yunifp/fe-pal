/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

// 1. Kolom untuk Tabel Rekap (Halaman Utama) - TANPA TOMBOL AKSI
export const getRekapColumns = (): ColumnDef<any>[] => [
  { id: "no", header: "No", cell: ({ row }) => row.index + 1 },
  { accessorKey: "tinggal_prov", header: "Provinsi" },
  { 
    accessorKey: "tinggal_kab_kota", 
    header: "Kabupaten/Kota",
    cell: ({ row }) => {
      const kodeKab = row.original.tinggal_kode_kab;
      const namaKab = row.original.tinggal_kab_kota;
      
      return (
        <Link 
          to={`/pembagian_wilayah/${kodeKab}`} 
          className="text-primary hover:text-primary/80 hover:underline font-semibold cursor-pointer transition-colors"
        >
          {namaKab || "Detail Wilayah"}
        </Link>
      );
    }
  },
  { accessorKey: "jml_ktp", header: "Sesuai KTP (Jumlah)" },
  { accessorKey: "jml_kebun", header: "Sesuai Kebun (Jumlah)" },
];

// 2. Kolom untuk Tabel Detail dengan Combobox
export const getDetailColumns = (
  selectedIds: number[],
  onToggleSelect: (idTrx: number) => void,
  onToggleSelectAll: (checked: boolean, data: any[]) => void,
  data: any[]
): ColumnDef<any>[] => [
  { id: "no", header: "No", cell: ({ row }) => row.index + 1 },
  { accessorKey: "nama_lengkap", header: "Nama Lengkap" },
  { accessorKey: "ktp", header: "Alamat KTP" },
  { accessorKey: "kerja_kab_kota", header: "Alamat Berkebun" },
  {
    id: "aksi",
    header: () => (
      <Checkbox
        checked={data.length > 0 && selectedIds.length === data.length}
        onCheckedChange={(val) => onToggleSelectAll(!!val, data)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      const id = row.original.id_trx_beasiswa;
      return (
        <Checkbox
          checked={selectedIds.includes(id)}
          onCheckedChange={() => onToggleSelect(id)}
          aria-label="Select row"
        />
      );
    },
  },
  {
    id: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => {
      const flag = row.original.flag_kewilayahan;
      return (
        <span className="font-semibold text-gray-700">
          {flag === 1 ? "BERKEBUN" : "SESUAI KTP"}
        </span>
      );
    },
  },
];