import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BadgeFlowBeasiswa from "@/components/beasiswa/BadgeFlowBeasiswa";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "pendaftar",
    header: "Pendaftar",
    cell: ({ row }) => {
      return (
        <>
          <div className="flex items-center gap-4">
            <img
              src={row.original.foto!!}
              alt={row.original.nama_lengkap!!}
              className="w-auto h-24"
            />
            <div>
              <div>{row.original.nama_lengkap}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.nik}
              </div>
            </div>
          </div>
        </>
      );
    },
  },
  {
    id: "no_reg",
    header: "No Registrasi Pendaftaran",
    cell: ({ row }) => {
      return (
        <>
          <div className="flex items-center gap-4">
            <div>
              <div>{row.original.kode_pendaftaran}</div>
            </div>
          </div>
        </>
      );
    },
  },
  {
    id: "jalur",
    header: "Jalur kategori pendaftar",
    cell: ({ row }) => {
      return (
        <>
          <div className="flex items-center gap-4">
            <div>
              <div>{row.original.jalur}</div>
            </div>
          </div>
        </>
      );
    },
  },
  {
    id: "status_pendaftaran",
    header: "Status Pendaftaran",
    cell: ({ row }) => <BadgeFlowBeasiswa id={row.original.id_flow} />,
  },
  {
    id: "hasil_dinas_provinsi",
    header: "Hasil Verifikasi",
    cell: ({ row }) => {
      const value = row.original.hasil_dinas_provinsi;

      let label = "-";
      let className =
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border";

      if (value === "1") {
        label = "Rekomendasi";
        className += " bg-green-50 text-green-700 border-green-200";
      } else if (value === "2") {
        label = "Tidak Rekomendasi";
        className += " bg-red-50 text-red-700 border-red-200";
      } else if (value === "0") {
        label = "Belum Diverifikasi";
        className += " bg-yellow-50 text-yellow-700 border-yellow-200";
      }

      return (
        <span className={className}>
          <span className="w-1 h-1 rounded-full bg-current"></span>
          {label}
        </span>
      );
    },
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const beasiswa = row.original;
      const navigate = useNavigate();
      // const canUpdate = useHasAccess("U");

      // if (!canUpdate) return null;

      return (
        <Button
          onClick={() => {
            navigate(
              `/beasiswa_verifikasi_dinas_provinsi/detail/${beasiswa.id_trx_beasiswa}`,
            );
          }}>
          <ShieldCheck className="h-4 w-4 mr-1" size={"sm"} /> Verifikasi
        </Button>
      );
    },
  },
];
