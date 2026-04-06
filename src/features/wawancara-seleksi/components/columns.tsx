/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getWawancaraColumns = (
  pageIndex: number, 
  pageSize: number,
  onUpdateStatus: (id: number, value: string) => void
): ColumnDef<any>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => pageIndex * pageSize + row.index + 1 
  },
  { 
    accessorKey: "nama_lengkap", 
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-semibold">{row.original.nama_lengkap}</span>
  },
  { accessorKey: "nik", header: "NIK" },
  { accessorKey: "kode_pendaftaran", header: "Kode Pendaftaran" },
  { accessorKey: "jalur", header: "Jalur" },
  { 
    accessorKey: "nama_kluster", 
    header: "Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return (
        <Badge variant={kluster === "Afirmasi" ? "destructive" : "default"}>
          {kluster || "-"}
        </Badge>
      );
    }
  },
  { 
    accessorKey: "nilai_temp", 
    header: "Nilai",
    cell: ({ row }) => {
      const nilai = row.original.nilai_temp;
      return nilai ? (
        <span className="font-bold text-gray-800">{nilai}</span>
      ) : (
        <span className="italic text-gray-400 text-sm">Belum dinilai</span>
      );
    }
  },
  { 
    accessorKey: "status_wawancara", 
    header: "Status Wawancara",
    cell: ({ row }) => {
      const idTrx = row.original.id_trx_beasiswa;
      const status = row.original.status_wawancara || "";
      
      return (
        <select
          value={status}
          onChange={(e) => onUpdateStatus(idTrx, e.target.value)}
          className={`border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary w-[160px] ${
            status === "Rekomendasi" ? "border-green-300 bg-green-50 text-green-700" :
            status === "Tidak Rekomendasi" ? "border-red-300 bg-red-50 text-red-700" :
            "border-gray-300 bg-white text-gray-700"
          }`}
        >
          <option value="" disabled>-- Pilih Status --</option>
          <option value="Rekomendasi">Rekomendasi</option>
          <option value="Tidak Rekomendasi">Tidak Rekomendasi</option>
        </select>
      );
    }
  },
];