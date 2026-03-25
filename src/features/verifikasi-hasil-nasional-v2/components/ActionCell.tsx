import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { DetailPendaftarRow } from "@/types/beasiswa";

interface ActionCellProps {
  row: Row<DetailPendaftarRow>;
  onUbahKluster: (id: number, kluster: string) => void;
}

export const ActionCell: React.FC<ActionCellProps> = ({ row, onUbahKluster }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKluster, setSelectedKluster] = useState<string>("");

  const pendaftar = row.original;

  if (!pendaftar.is_3t && !pendaftar.is_sktm) {
    return <span className="text-gray-400 font-bold">-</span>;
  }

  const handleSelect = (kluster: string) => {
    setSelectedKluster(kluster);
    setOpenDialog(true);
  };

  const handleConfirm = () => {
    onUbahKluster(pendaftar.id_trx_beasiswa, selectedKluster);
    setOpenDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="h-8">
            Ubah Kluster <ChevronDown className="ml-2 w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSelect("Afirmasi")}>
            Afirmasi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelect("Reguler")}>
            Reguler
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status kluster <strong>{pendaftar.nama_lengkap}</strong> menjadi <strong>{selectedKluster}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Ya, Ubah</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};