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

  const handleSelect = (kluster: string) => {
    setSelectedKluster(kluster);
    setOpenDialog(true);
  };

  const handleConfirm = () => {
    onUbahKluster(pendaftar.id_trx_beasiswa, selectedKluster);
    setOpenDialog(false);
  };

  return (
    <div className="flex items-center gap-2">
      {(!pendaftar.is_3t && !pendaftar.is_sktm) ? (
        <span className="text-slate-300 font-bold ml-4">-</span>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all px-4 font-semibold">
              Ubah <ChevronDown className="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-100 p-1.5 min-w-[140px]">
            <DropdownMenuItem onClick={() => handleSelect("Afirmasi")} className="cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 rounded-lg py-2 font-medium transition-colors">
              Afirmasi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelect("Reguler")} className="cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 rounded-lg py-2 font-medium transition-colors">
              Reguler
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Ubah Kluster?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-2">
              Apakah Anda yakin ingin mengubah status kluster pendaftar <strong className="text-slate-800">{pendaftar.nama_lengkap}</strong> menjadi <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{selectedKluster}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={() => setOpenDialog(false)} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};