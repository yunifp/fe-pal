import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IUser } from "../types/user";
import type { IRole } from "@/features/role/types/role";
import useHasAccess from "@/hooks/useHasAccess";

export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<IUser>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nama_lengkap",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Lengkap
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    header: "Role",
    cell: ({ row }) => {
      const roles = row.original.role;

      return (
        <ul className="list-disc">
          {roles.map((role: IRole) => (
            <li key={role.id}>{role.nama}</li>
          ))}
        </ul>
      );
    },
  },
  {
    header: "Status Akun",
    cell: ({ row }) => {
      const status = row.original.is_active == 1 ? "Aktif" : "Tidak Aktif";
      const statusColors: Record<typeof status, string> = {
        Aktif: "bg-green-500",
        "Tidak Aktif": "bg-red-500",
      };

      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <p>{status}</p>
        </div>
      );
    },
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const user = row.original;
      const navigate = useNavigate();
      const canUpdate = useHasAccess("U");
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
            {canUpdate && (
              <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(user.id)}
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
