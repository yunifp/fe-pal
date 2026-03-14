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
import type { IMenu } from "@/types/menu";
import DynamicIcon from "@/components/DynamicIcon";
import useHasAccess from "@/hooks/useHasAccess";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<IMenu>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const icon = row.original.icon;
      return <DynamicIcon name={icon} />;
    },
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const menu = row.original;
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
              <DropdownMenuItem onClick={() => navigate(`/menus/${menu.id}`)}>
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(menu.id)}
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
