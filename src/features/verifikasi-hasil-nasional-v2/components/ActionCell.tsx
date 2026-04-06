/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { ChevronDown, Map, CheckCircle2, XCircle, Clock, Circle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"; // <-- Import Separator
import type { DetailPendaftarRow } from "@/types/beasiswa";

interface ActionCellProps {
  row: Row<DetailPendaftarRow>;
  onUbahKluster: (id: number, kluster: string) => void;
}

// --- LOGIKA MAPPING FLOW KE STEP PROGRESS ---
const FLOW_STEPS = [
  { order: 1, label: "Pendaftaran Account", desc: "User mendaftarkan akun", flows: [1] },
  { order: 2, label: "Verifikasi Administrasi", desc: "Pengecekan dokumen awal", flows: [2, 3, 4, 5] }, // 3 Ditolak, 4 Perbaikan, 5 Hasil Perbaikan
  { order: 3, label: "Lulus Administrasi (Kewilayahan)", desc: "Validasi wilayah", flows: [13] },
  { order: 4, label: "Verifikasi Dinas Kab/Kota", desc: "Pengecekan di tingkat daerah", flows: [6] },
  { order: 5, label: "Verifikasi Dinas Provinsi", desc: "Pengecekan di tingkat provinsi", flows: [7] },
  { order: 6, label: "Verifikasi Nasional", desc: "Pengecekan akhir tingkat pusat", flows: [9] },
  { order: 7, label: "Tes Seleksi", desc: "Peserta mengikuti ujian", flows: [10] },
  { order: 8, label: "Penelaahan", desc: "Analisis hasil tes", flows: [11] },
  { order: 9, label: "Rekomendasi Teknis", desc: "Penentuan kelayakan teknis", flows: [12] },
  { order: 10, label: "Penetapan SK", desc: "Pengesahan penerima beasiswa", flows: [14] },
];

export const ActionCell: React.FC<ActionCellProps> = ({ row, onUbahKluster }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [selectedKluster, setSelectedKluster] = useState<string>("");

  const pendaftar = row.original;
  const currentFlowId = pendaftar.id_flow;

  // Mencari user berada di urutan step ke berapa
  const currentStepInfo = FLOW_STEPS.find(s => s.flows.includes(currentFlowId)) || FLOW_STEPS[0];
  const currentOrder = currentStepInfo.order;
  const isRejected = currentFlowId === 3; // 3 = Ditolak

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
      {/* TOMBOL LIHAT PROGRESS */}
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() => setOpenProgressModal(true)}
        title="Lihat Progress Alur"
      >
        <Map className="w-4 h-4" />
      </Button>

      {/* DROPDOWN UBAH KLUSTER */}
      {(!pendaftar.is_3t && !pendaftar.is_sktm) ? (
        <span className="text-gray-400 font-bold ml-2">-</span>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="h-8">
              Ubah <ChevronDown className="ml-2 w-4 h-4" />
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
      )}

      {/* MODAL KONFIRMASI UBAH KLUSTER */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Kluster</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status kluster <strong>{pendaftar.nama_lengkap}</strong> menjadi <strong>{selectedKluster}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Ya, Ubah</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL PROGRESS / ALUR (DI-LEBAR-KAN & DESAIN BARU) */}
      <Dialog open={openProgressModal} onOpenChange={setOpenProgressModal}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl border-0 p-0 overflow-hidden shadow-2xl rounded-3xl">
          <DialogHeader className="bg-slate-900 text-white p-6 pb-5">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-3">
              <Map className="w-6 h-6 text-emerald-400" />
              Alur Progress Pendaftar
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8">
            <div className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">{pendaftar.nama_lengkap}</h4>
                <p className="text-xs text-slate-500 font-medium">Kode Pendaftaran: {pendaftar.kode_pendaftaran}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                isRejected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800"
              }`}>
                Step Saat Ini: {currentStepInfo.label}
              </span>
            </div>

            <Separator className="mb-8" />

            {/* VERTICAL TIMELINE STEPPER (DESAIN BARU & PROMINENT) */}
            <div className="relative h-[55vh] overflow-y-auto px-2">
              {FLOW_STEPS.map((step, index) => {
                const isCompleted = step.order < currentOrder;
                const isCurrent = step.order === currentOrder;
                const isPending = step.order > currentOrder;
                const isFirst = index === 0;
                const isLast = index === FLOW_STEPS.length - 1;

                // Tentukan icon dan warna berdasarkan status
                let Icon = Circle;
                let circleColorClass = "border-slate-300 text-slate-300 bg-white";
                let textColorClass = "text-slate-400";
                let descText = step.desc || "Menunggu antrean";
                let lineColorClass = "bg-slate-200";

                if (isCompleted) {
                  Icon = CheckCircle2;
                  circleColorClass = "border-emerald-600 text-emerald-600 bg-white shadow-md shadow-emerald-100";
                  textColorClass = "text-slate-800";
                  descText = "Langkah telah diselesaikan";
                  lineColorClass = "bg-emerald-500";
                } else if (isCurrent) {
                  circleColorClass = `border-2 ${isRejected ? 'border-red-600 text-red-600' : 'border-blue-600 text-blue-600'} bg-white shadow-lg ${isRejected ? 'shadow-red-200' : 'shadow-blue-200'}`;
                  textColorClass = `${isRejected ? 'text-red-700' : 'text-blue-800'} font-bold`;
                  
                  if (isRejected) {
                    Icon = XCircle;
                    descText = "Pendaftaran Ditolak pada tahap ini.";
                  } else {
                    Icon = Clock;
                    // Keterangan khusus jika ada di perbaikan
                    if (currentFlowId === 4) descText = "Sedang tahap Perbaikan data oleh pendaftar.";
                    else if (currentFlowId === 5) descText = "Menunggu verifikasi Hasil Perbaikan.";
                    else descText = "Sedang dalam proses verifikasi.";
                  }
                  
                  // Warna garis menghubungkan ke langkah ini
                  lineColorClass = isRejected ? "bg-red-500" : "bg-blue-500";
                }

                return (
                  <div key={step.order} className="relative flex items-start gap-6 pb-12 group last:pb-0">
                    {/* Garis Vertikal */}
                    {!isLast && (
                      <div className={`absolute left-[18px] top-10 h-full w-[3px] rounded ${lineColorClass}`} />
                    )}

                    {/* Circle & Icon */}
                    <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 transition-all duration-300 ${circleColorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Teks Deskripsi */}
                    <div className="flex flex-col pt-0.5">
                      <span className={`text-base font-bold tracking-tight transition-all ${textColorClass}`}>
                        {step.label}
                      </span>
                      <span className={`text-sm ${isCurrent && !isRejected ? 'text-slate-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'} mt-1 leading-relaxed`}>
                        {descText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  );
};