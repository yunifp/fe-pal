import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, FileText, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { IAdminVerifikator } from "../types/db";

export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<IAdminVerifikator>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "user_id",
    header: "Username",
    cell: ({ row }) => row.original.user_id,
  },
  // {
  //     accessorKey: "pin",
  //     header: "PIN",
  //     cell: ({ row }) => {
  //       return row.original.telah_ganti_pin === "Y" ? (
  //         <span className="text-sm text-muted-foreground">
  //           Pin telah diganti pengguna
  //         </span>
  //       ) : (
  //         "123123"
  //       );
  //     },
  //   },
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
    accessorKey: "nama_lengkap",
    header: "Penanggung Jawab",
  },
  {
    header: "No. HP / Email",
    cell: ({ row }) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{row.original.no_hp ?? "-"}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.email ?? "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "lembaga_pendidikan",
    header: "Lembaga Pendidikan",
    cell: ({ getValue }) => (
      <div className="whitespace-normal break-words">{getValue<string>()}</div>
    ),
  },
  {
    header: "Surat Penunjukan",
    cell: ({ row }) => {
      const file = row.original.surat_penunjukan;

      if (!file) return <span className="text-muted-foreground">-</span>;

      return (
        <Button variant="outline" size="sm" asChild>
          <a href={file} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4" />
            Lihat
          </a>
        </Button>
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
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
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/database/user-admin-verifikator/edit/${user.id}`)
                }
              >
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(user.id!!)}
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
