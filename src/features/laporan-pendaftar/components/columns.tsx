/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ILaporanPendaftar } from "@/types/laporanPendaftar";
import { Check, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ActionCell = ({ row, refetch }: { row: any; refetch?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const idFlow = row.original.id_flow || 0;
  
  // PERUBAHAN DI SINI: Tombol hanya muncul jika id_flow sama dengan 13
  const showKembalikanButton = idFlow === 13;

  const handleRevertFlow = async () => {
    setIsLoading(true);
    try {
      // Menggunakan axios instance kamu, URL diarahkan sesuai routing backend
      const response = await axiosInstanceBeasiswa.put(`/laporan/pendaftar/revert-flow-2/${row.original.id_trx_beasiswa}`);
      
      if (response.status === 200) {
        toast.success("Status pendaftar berhasil dikembalikan ke Selektor.");
        setIsOpen(false);
        if (refetch) {
          refetch(); 
        } else {
          window.location.reload();
        }
      } else {
        throw new Error("Gagal merubah flow");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memproses pengembalian flow.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link to={`/laporan-pendaftar/${row.original.id_trx_beasiswa}`}>
        <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200">
          <Eye className="w-4 h-4 mr-2" />
          Detail
        </Button>
      </Link>

      {/* Render tombol jika kondisinya terpenuhi (id_flow === 13) */}
      {showKembalikanButton && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-200"
            onClick={() => setIsOpen(true)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Kembalikan Ke Selektor
          </Button>

          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin mengembalikan pendaftar{" "}
                  <span className="font-bold text-gray-800">{row.original.nama_lengkap}</span>{" "}
                  ke Selektor? Status Lulus Administrasinya akan ditarik kembali.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault(); 
                    handleRevertFlow();
                  }}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isLoading ? "Memproses..." : "Ya, Kembalikan"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export const getColumns = (
  page: number,
  limit: number,
  refetch?: () => void 
): ColumnDef<ILaporanPendaftar>[] => [
  {
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 50,
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-700">
        {row.original.kode_pendaftaran || "-"}
      </span>
    ),
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {row.original.nama_lengkap || "-"}
      </span>
    ),
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => row.original.nik || "-",
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
    cell: ({ row }) => <span>{row.original.jalur || "-"}</span>,
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} refetch={refetch} />,
  },
];

export const getCekalColumns = (
  page: number,
  limit: number
): ColumnDef<any>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => (page - 1) * limit + info.row.index + 1,
    size: 60,
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.nama || "-"}</span>,
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.nik}</span>,
  },
  {
    accessorKey: "tahun",
    header: "Tahun",
    cell: ({ row }) => <span className="text-slate-600">{row.original.tahun || "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span className="text-slate-600">{row.original.keterangan || "-"}</span>,
  },
  {
    accessorKey: "is_aktif",
    header: "Aktif Cekal",
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.is_aktif === "Y" && (
          <Check className="w-5 h-5 text-emerald-600 font-bold" />
        )}
      </div>
    ),
    size: 100,
  },
];  