/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "../../../components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import useHasAccess from "../../../hooks/useHasAccess";
import type { IAdminVerifikator } from "../types/db";
import { SecureDownloadButton } from "../../../components/SecureDownloadButton";

export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<IAdminVerifikator>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "username",
    header: "Username",
    cell: ({ row }) => row.original.username || row.original.user_id || "-",
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
    id: "nama_lengkap",
    header: "Penanggung Jawab",
    cell: ({ row }) => row.original.nama_lengkap || row.original.nama || "-",
  },
  {
    header: "No. HP / Email",
    cell: ({ row }) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{row.original.no_hp || "-"}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.email || "-"}
        </span>
      </div>
    ),
  },
  {
    id: "instansi",
    header: "Instansi / Lembaga",
    cell: ({ row }) => {
      const data = row.original as any;
      const instansiName = 
        data.kab_kota || 
        data.kabkota || 
        data.prov || 
        data.provinsi || 
        "-";
      
      return (
        <div className="whitespace-normal break-words">{instansiName}</div>
      );
    },
  },
  {
    header: "Surat Penunjukan",
    cell: ({ row }) => {
      const file = row.original.surat_penunjukan;

      if (!file) return <span className="text-muted-foreground">-</span>;

      return (
        <SecureDownloadButton 
          url={file}
          filename={`Surat_Penunjukan_${row.original.username || "Instansi"}.pdf`}
          label="Lihat"
        />
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
                  navigate(
                    `/database/user-admin-verifikator-dinas/edit/${user.id}`,
                  )
                }>
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(user.id!!)}
                className="bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:text-white hover:text-white">
                <Trash className="h-4 w-4 mr-1 text-white" /> Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];