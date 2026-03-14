import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import type { ITrxPksWithJumlahPerubahan } from "@/types/pks";
import { Link } from "react-router-dom";

export const getColumns = (): ColumnDef<ITrxPksWithJumlahPerubahan>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "no_pks",
    header: "No PKS",
  },
  {
    accessorKey: "lembaga_pendidikan",
    header: "Lembaga Pendidikan",
    cell: ({ getValue }) => (
      <div className="whitespace-normal break-words">{getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "jenjang",
    header: "Jenjang",
  },
  {
    accessorKey: "tahun_angkatan",
    header: "Tahun Angkatan",
  },
  {
    id: "perubahan",
    header: "Konfirmasi Perubahan Data",
    cell: ({ row }) => {
      const {
        jumlah_perubahan_rekening,
        jumlah_perubahan_status_aktif,
        jumlah_perubahan_ipk,
      } = row.original;

      return (
        <div className="flex items-center gap-2 flex-wrap">
          {jumlah_perubahan_rekening!! > 0 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              Rekening: {jumlah_perubahan_rekening}
            </span>
          )}

          {jumlah_perubahan_status_aktif!! > 0 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              Status Aktif: {jumlah_perubahan_status_aktif}
            </span>
          )}

          {jumlah_perubahan_ipk!! > 0 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              IPK: {jumlah_perubahan_ipk}
            </span>
          )}
        </div>
      );
    },
  },

  {
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link to={"/database/mahasiswa/pks/" + row.original.id}>
            <Users className="w-4 h-4" />
            Kelola Mahasiswa
          </Link>
        </Button>
      );
    },
  },
];
