import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Info, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BadgeFlowBeasiswa from "@/components/beasiswa/BadgeFlowBeasiswa";
import { BadgeStatusKelulusan } from "@/components/beasiswa/BadgeStatusKelulusan";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "pengaju",
    header: "Pengaju",
    cell: ({ row }) => {
      return (
        <>
          <div>{row.original.nama_lengkap}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.nik}
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
    id: "status_kelulusan",
    header: "Status Kelulusan Verifikator Dinas",
    cell: ({ row }) => (
      <BadgeStatusKelulusan
        value={row.original.status_dari_verifikator_dinas}
      />
    ),
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const beasiswa = row.original;
      const navigate = useNavigate();
      const canDelete = useHasAccess("D");

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-inter space-y-0.5">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            {true && (
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    `/beasiswa_verifikasi_dinas/detail/${beasiswa.id_trx_beasiswa}`,
                  )
                }
              >
                <Info className="h-4 w-4 mr-1" /> Detail
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(beasiswa.id_trx_beasiswa)}
                className="bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:text-white hover:text-white"
              >
                <Trash className="h-4 w-4 mr-1 text-white" /> Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
