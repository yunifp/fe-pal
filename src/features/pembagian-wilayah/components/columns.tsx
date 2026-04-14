/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export const getRekapColumns = (): ColumnDef<any>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span> 
  },
  { 
    accessorKey: "tinggal_prov", 
    header: "Provinsi",
    cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.tinggal_prov}</span>
  },
  { 
    accessorKey: "tinggal_kab_kota", 
    header: "Kabupaten/Kota",
    cell: ({ row }) => {
      const kodeKab = row.original.tinggal_kode_kab;
      const namaKab = row.original.tinggal_kab_kota;
      
      return (
        <Link 
          to={`/pembagian_wilayah/${kodeKab}`} 
          className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer transition-colors hover:underline decoration-emerald-300 underline-offset-4"
        >
          {namaKab || "Detail Wilayah"}
        </Link>
      );
    }
  },
  { 
    accessorKey: "jml_ktp", 
    header: "Sesuai KTP",
    cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.jml_ktp}</span> 
  },
  { 
    accessorKey: "jml_bekerja", 
    header: "Sesuai Bekerja",
    cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.jml_bekerja}</span> 
  }, 
];

export const getDetailColumns = (
  selectedIds: number[],
  onToggleSelect: (idTrx: number) => void,
  onToggleSelectAll: (checked: boolean, data: any[]) => void,
  data: any[]
): ColumnDef<any>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span> 
  },
  {
    id: "aksi",
    header: () => (
      <Checkbox
        checked={data.length > 0 && selectedIds.length === data.length}
        onCheckedChange={(val) => onToggleSelectAll(!!val, data)}
        aria-label="Select all"
        className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md"
      />
    ),
    cell: ({ row }) => {
      const id = row.original.id_trx_beasiswa;
      return (
        <Checkbox
          checked={selectedIds.includes(id)}
          onCheckedChange={() => onToggleSelect(id)}
          aria-label="Select row"
          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md"
        />
      );
    },
  },
  { 
    accessorKey: "nama_lengkap", 
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_lengkap}</span>
  },
  { 
    accessorKey: "ktp", 
    header: "Alamat KTP",
    cell: ({ row }) => <span className="text-slate-600 leading-snug">{row.original.ktp}</span>
  },
  { 
    accessorKey: "kerja_kab_kota", 
    header: "Alamat Bekerja",
    cell: ({ row }) => <span className="text-slate-600 leading-snug">{row.original.kerja_kab_kota}</span>
  }, 
  {
    id: "keterangan",
    header: "Dinas Seleksi",
    cell: ({ row }) => {
      const flag = row.original.flag_kewilayahan;
      const isBekerja = flag === 1;
      
      return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border ${
          isBekerja 
            ? "bg-teal-50 border-teal-100 text-teal-700" 
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }`}>
          {isBekerja ? "BEKERJA" : "SESUAI KTP"}
        </span>
      );
    },
  },
];