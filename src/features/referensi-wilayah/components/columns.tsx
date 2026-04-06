import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { IReferensiWilayah } from "@/types/wilayah";

export const getColumnsWilayah = (
  level: "provinsi" | "kabkota" | "kecamatan",
  onEdit: (data: IReferensiWilayah) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<IReferensiWilayah>[] => [
  {
    header: "No",
    cell: (info) => info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: level === "provinsi" ? "kode_pro" : level === "kabkota" ? "kode_kab" : "kode_kec",
    header: `Kode ${level === "provinsi" ? "Provinsi" : level === "kabkota" ? "Kab/Kota" : "Kecamatan"}`,
  },
  {
    accessorKey: "nama_wilayah",
    header: "Nama Wilayah",
    cell: ({ row }) => {
      const data = row.original;
      
      // Jika level kecamatan, tidak bisa diklik (karena tidak ada level desa di skenario ini)
      if (level === "kecamatan") {
        return <span className="font-medium text-gray-700">{data.nama_wilayah}</span>;
      }

      // Jika provinsi atau kabkota, buatkan link
      const nextUrl = level === "provinsi" 
        ? `/master/referensi-wilayah/${data.kode_pro}` 
        : `/master/referensi-wilayah/${data.kode_pro}/${data.kode_kab}`;

      return (
        <Link to={nextUrl} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-fit transition-colors">
          {data.nama_wilayah} <ChevronRight className="w-3 h-3 opacity-50" />
        </Link>
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(data)}>
            <Edit className="w-4 h-4 mr-1 text-amber-600" /> Ubah
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(data.wilayah_id, data.nama_wilayah)}>
            <Trash className="w-4 h-4 mr-1" /> Hapus
          </Button>
        </div>
      );
    },
  },
];