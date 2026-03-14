import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBeasiswa } from "@/types/beasiswa";

export const getColumns = (
  onVerifikasiClick: (id: number) => void,
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
    accessorKey: "alamat",
    header: "Alamat",
  },

  {
    id: "aksi",
    cell: ({ row }) => {
      const beasiswa = row.original;
      const canUpdate = useHasAccess("U");

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
            {canUpdate && (
              <DropdownMenuItem
                onClick={() => onVerifikasiClick(beasiswa.id_trx_beasiswa)}
                className="bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white hover:text-white"
              >
                <ClipboardCheck className="h-4 w-4 mr-1 text-white" />{" "}
                Verifikasi
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
