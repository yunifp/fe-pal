import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { IRole } from "../types/role";
import { Edit, ListChecks, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<IRole>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const role = row.original;
      const navigate = useNavigate();
      const canDelete = useHasAccess("D");
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
                onClick={() => navigate(`/roles/access/${role.id}`)}
              >
                <ListChecks className="h-4 w-4 mr-1" /> Hak Akses
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <DropdownMenuItem onClick={() => navigate(`/roles/${role.id}`)}>
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(role.id)}
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
