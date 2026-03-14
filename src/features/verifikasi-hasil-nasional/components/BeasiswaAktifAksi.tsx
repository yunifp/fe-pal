import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IBeasiswa } from "@/types/beasiswa";
import { GraduationCap, Lock, AlertTriangle } from "lucide-react";
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
                onClick={() => setShowMore(!showMore)}
              >
                {" "}
                {showMore ? "Sembunyikan" : "Lihat Selengkapnya"}
              </span>
            )}
          </p>
        </div>

        {/* Confirmation Box */}
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
                    className="text-amber-900 border-amber-300 hover:bg-amber-100"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmTutup}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "Menutup..." : "Ya, Tutup Pendaftaran"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-center">
            {!showConfirm && (
              <Button
                variant="destructive"
                size="default"
                onClick={handleTutupClick}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 shadow-md"
              >
                <Lock className="h-4 w-4 mr-2" />
                Tutup Pendaftaran
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeasiswaAktifAksi;
