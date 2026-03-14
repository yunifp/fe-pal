import type { ColumnDef } from "@tanstack/react-table";
import type { IMahasiswaPks } from "@/types/pks";

export const getColumnsMahasiswa = (
  onClickNama: (data: IMahasiswaPks) => void,
): ColumnDef<IMahasiswaPks>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === 1;

      const statusText = isActive ? "Aktif" : "Tidak Aktif";
      const statusColor = isActive ? "bg-green-500" : "bg-red-500";

      return (
        <div className="flex flex-col gap-1">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColor}`} />
            <p className="font-medium">{statusText}</p>
          </div>

          {/* Jika Tidak Aktif */}
          {!isActive && (
            <div className="ml-4 space-y-1 text-xs text-muted-foreground">
              {/* Alasan */}
              {row.original.alasan_tidak_aktif && (
                <p>
                  <span className="font-medium text-foreground">Alasan:</span>{" "}
                  {row.original.alasan_tidak_aktif}
                </p>
              )}

              {/* Download File */}
              {row.original.file_pendukung && (
                <span>
                  File Pendukung:{" "}
                  <a
                    href={row.original.file_pendukung}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Unduh
                  </a>
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "nim",
    header: "NIM",
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
    header: "Asal",
    cell: ({ row }) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{row.original.asal_kota ?? "-"}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.asal_provinsi ?? "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "angkatan",
    header: "Angkatan",
  },
  {
    header: "Bank & No Rekening",
    cell: ({ row }) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{row.original.bank ?? "-"}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.no_rekening ?? "-"}
        </span>
      </div>
    ),
  },
  {
    header: "No. HP / Email",
    cell: ({ row }) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{row.original.hp ?? "-"}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.email ?? "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "kluster",
    header: "Kluster",
  },
];
