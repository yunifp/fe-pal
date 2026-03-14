import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, GraduationCap, ListChecks, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { IPerguruanTinggi } from "@/types/master";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (): ColumnDef<IPerguruanTinggi>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nama_pt",
    header: "Nama",
  },
  {
    header: "Singkatan",
    cell: ({ row }) => row.original.singkatan ?? "-",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const perguruanTinggi = row.original;
      const navigate = useNavigate();
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
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `/perguruan-tinggi/${perguruanTinggi.id_pt}/program-studi`,
                )
              }
            >
              <GraduationCap className="h-4 w-4 mr-1" /> Program Studi
            </DropdownMenuItem>
            {canUpdate && (
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    `/perguruan-tinggi/${perguruanTinggi.id_pt}/mapping-pendaftaran-beasiswa`,
                  )
                }
              >
                <ListChecks className="h-4 w-4 mr-1" /> Mapping Pendaftaran
                Beasiswa
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      `/master/perguruan-tinggi/${perguruanTinggi.id_pt}`,
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-1" /> Ubah
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
