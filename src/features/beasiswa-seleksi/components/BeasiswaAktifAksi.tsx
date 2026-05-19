/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { IBeasiswa } from "@/types/beasiswa";
import { GraduationCap, Lock, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { toast } from "sonner";

interface BeasiswaAktifAksiProps {
  beasiswa: IBeasiswa | null;
  onTutupPendaftaran?: () => void;
  isLoading?: boolean;
}

const BeasiswaAktifAksi = ({
  beasiswa,
  onTutupPendaftaran,
  isLoading = false,
}: BeasiswaAktifAksiProps) => {
  const queryClient = useQueryClient();
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // State untuk Modal Atur Tanggal
  const [showSetTanggal, setShowSetTanggal] = useState<boolean>(false);
  const [tanggalMulai, setTanggalMulai] = useState<string>("");
  const [tanggalSelesai, setTanggalSelesai] = useState<string>("");

  // Mutation untuk Tutup Beasiswa
  const tutupMutation = useMutation({
    mutationFn: async (data: number) => {
      return await masterService.tutupBeasiswa(data);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["beasiswa-aktif"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  // Mutation untuk Set Tanggal Beasiswa
  const updateTanggalMutation = useMutation({
    mutationFn: async ({
      idBeasiswa,
      data,
    }: {
      idBeasiswa: number;
      data: { tanggal_mulai: string; tanggal_selesai: string };
    }) => {
      return await masterService.updateTanggalBeasiswa(idBeasiswa, data);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        setShowSetTanggal(false);
        queryClient.invalidateQueries({ queryKey: ["beasiswa-aktif"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat memperbarui tanggal");
      }
    },
  });

  if (!beasiswa) {
    return (
      <Card className="w-full shadow-none transition-all duration-300 border-t-4 border-t-primary">
        <CardContent className="px-8 py-6">
          <p className="text-center text-slate-600 font-medium">
            Tidak ada beasiswa yang sedang aktif
          </p>
        </CardContent>
      </Card>
    );
  }

  const MAX_LENGTH = 400;
  const isLongText = beasiswa.informasi.length > MAX_LENGTH;
  const displayedText = showMore
    ? beasiswa.informasi
    : beasiswa.informasi.slice(0, MAX_LENGTH) + (isLongText ? "..." : "");

  const handleTutupClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmTutup = () => {
    onTutupPendaftaran?.();
    tutupMutation.mutate(beasiswa.id);
    setShowConfirm(false);
  };

  // Handler membuka modal dan memformat tanggal yang sudah ada (jika ada)
  const handleOpenAturTanggal = () => {
    if (beasiswa?.tanggal_mulai) {
      const dateObj = new Date(beasiswa.tanggal_mulai);
      if (!isNaN(dateObj.getTime())) {
        const localIso = new Date(
          dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);
        setTanggalMulai(localIso);
      }
    } else {
      setTanggalMulai("");
    }

    if (beasiswa?.tanggal_selesai) {
      const dateObj = new Date(beasiswa.tanggal_selesai);
      if (!isNaN(dateObj.getTime())) {
        const localIso = new Date(
          dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);
        setTanggalSelesai(localIso);
      }
    } else {
      setTanggalSelesai("");
    }

    setShowSetTanggal(true);
  };

  // Submit perubahan tanggal
  const handleSubmitTanggal = () => {
    if (!tanggalMulai || !tanggalSelesai) {
      toast.error("Tanggal mulai dan tanggal selesai wajib diisi");
      return;
    }

    // Mengubah format "YYYY-MM-DDTHH:mm" menjadi "YYYY-MM-DD HH:mm:ss" untuk backend
    const formattedMulai = tanggalMulai.replace("T", " ") + ":00";
    const formattedSelesai = tanggalSelesai.replace("T", " ") + ":00";

    updateTanggalMutation.mutate({
      idBeasiswa: beasiswa.id,
      data: {
        tanggal_mulai: formattedMulai,
        tanggal_selesai: formattedSelesai,
      },
    });
  };

  return (
    <Card className="w-full shadow-none transition-all duration-300 border-t-4 border-t-primary">
      <CardContent className="px-8 py-4">
        {/* Header dengan Badge Status */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-xl shadow-md">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {beasiswa.nama_beasiswa}
              </h2>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary mb-6" />

        {/* Informasi */}
        <div className="prose prose-slate max-w-none mb-6">
          <p className="text-slate-700 text-md leading-relaxed whitespace-pre-line">
            {displayedText}
            {isLongText && (
              <span
                className="text-primary px-0 hover:cursor-pointer font-medium hover:underline"
                onClick={() => setShowMore(!showMore)}>
                {" "}
                {showMore ? "Sembunyikan" : "Lihat Selengkapnya"}
              </span>
            )}
          </p>
        </div>

        {/* Confirmation Box Tutup */}
        {showConfirm && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  Konfirmasi Tutup Pendaftaran
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  Apakah Anda yakin ingin menutup pendaftaran beasiswa ini?
                  Setelah ditutup, tidak ada pendaftar baru yang dapat
                  mendaftar.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                    className="text-amber-900 border-amber-300 hover:bg-amber-100">
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmTutup}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700">
                    {isLoading ? "Menutup..." : "Ya, Tutup Pendaftaran"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Section (Tutup Pendaftaran & Atur Tanggal) */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-center gap-4">
            {!showConfirm && (
              <>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleOpenAturTanggal}
                  disabled={isLoading || updateTanggalMutation.isPending}
                  className="border-primary text-primary hover:bg-primary/10 shadow-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Atur Tanggal
                </Button>

                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleTutupClick}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 shadow-md">
                  <Lock className="h-4 w-4 mr-2" />
                  Tutup Pendaftaran
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Modal Dialog Atur Tanggal */}
        <Dialog open={showSetTanggal} onOpenChange={setShowSetTanggal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Atur Tanggal Pendaftaran</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                <Input
                  id="tanggal_mulai"
                  type="datetime-local"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                <Input
                  id="tanggal_selesai"
                  type="datetime-local"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSetTanggal(false)}
                disabled={updateTanggalMutation.isPending}>
                Batal
              </Button>
              <Button
                onClick={handleSubmitTanggal}
                disabled={updateTanggalMutation.isPending}>
                {updateTanggalMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BeasiswaAktifAksi;