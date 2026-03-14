import type { ColumnDef } from "@tanstack/react-table";
import type { IMahasiswaWithPks } from "@/types/pks";
import { Check, X } from "lucide-react";

export const getColumns = (
  onClickNama: (data: IMahasiswaWithPks) => void,
): ColumnDef<IMahasiswaWithPks>[] => [
  {
    id: "status",
    cell: ({ row }) => {
      const isActive = row.original.status === 1;

      return (
        <div className="flex items-center justify-center">
          {isActive ? (
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-1">
              <X className="h-4 w-4 text-red-600" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "lembaga_pendidikan",
    header: "Lembaga Pendidikan",
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
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "nim",
    header: "No. Register Mahasiswa",
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => onClickNama(row.original)}
        className="text-left font-medium text-primary underline cursor-pointer"
      >
        {row.original.nama}
      </button>
    ),
  },
  {
    accessorKey: "jenis_kelamin",
    header: "Jenis Kelamin",
  },
  {
    accessorKey: "kluster",
    header: "Status Kluster",
  },
  {
    id: "perubahan",
    header: "Perubahan",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex items-center gap-2 flex-wrap">
          {data.has_perubahan_rekening === 1 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              Rekening
            </span>
          )}

          {data.has_perubahan_status_aktif === 1 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              Status Aktif
            </span>
          )}

          {data.has_perubahan_ipk === 1 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              IPK
            </span>
          )}
        </div>
      );
    },
  },
];
