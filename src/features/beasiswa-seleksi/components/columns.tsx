import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
// import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BadgeFlowBeasiswa from "@/components/beasiswa/BadgeFlowBeasiswa";
import { ShieldCheck, Eye } from "lucide-react";

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
    id: "aksi",
    cell: ({ row }) => {
      const beasiswa = row.original;
      const navigate = useNavigate();
      const canUpdate = useHasAccess("U");

      const isViewOnly = [6, 7, 9, 10, 11, 12].includes(beasiswa.id_flow ?? 0);

      if (!canUpdate && !isViewOnly) return null;

      return (
        <Button
          variant={isViewOnly ? "outline" : "default"}
          onClick={() => {
            navigate(`/beasiswa_seleksi/detail/${beasiswa.id_trx_beasiswa}`);
          }}>
          {isViewOnly ? (
            <>
              <Eye className="h-4 w-4 mr-1" /> Lihat
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-1" /> Verifikasi
            </>
          )}
        </Button>
      );
    },
  },
  // {
  //   id: "aksi",
  //   cell: ({ row }) => {
  //     const beasiswa = row.original;
  //     const navigate = useNavigate();
  //     const canUpdate = useHasAccess("U");

  //     if (!canUpdate) return null;

  //     return (
  //       <Button
  //         onClick={() => {
  //           navigate(`/beasiswa_seleksi/detail/${beasiswa.id_trx_beasiswa}`);
  //         }}>
  //         <ShieldCheck className="h-4 w-4 mr-1" size={"sm"} /> Verifikasi
  //       </Button>
  //     );
  //   },
  // },
];
