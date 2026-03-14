import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Calendar,
  Send,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { pksService } from "@/services/pksService";
import { STALE_TIME } from "@/constants/reactQuery";
import { formatRupiah } from "@/utils/stringFormatter";
import type { ITrxPks, LockDataRequest } from "@/types/pks";
import { toast } from "sonner";
import LoadingDialog from "@/components/LoadingDialog";

interface KunciDataDialogProps {
  dataPks: ITrxPks;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KunciDataDialog({
  dataPks,
  open,
  onOpenChange,
}: KunciDataDialogProps) {
  const idTrxPks = dataPks.id;

  const { data: statistikMahasiswaResponse } = useQuery({
    queryKey: ["pks", "statistik-mahasiswa", idTrxPks],
    queryFn: () => pksService.getStatistikMahasiswa(idTrxPks),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const statistikMahasiswa = statistikMahasiswaResponse?.data;

  const totalBiayaHidup =
    (statistikMahasiswa?.total_mahasiswa_aktif ?? 0) *
    (dataPks.biaya_hidup ?? 0);

  const now = new Date();

  const bulan = now.toLocaleString("id-ID", { month: "long" });
  const tahun = now.getFullYear().toString();

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: LockDataRequest) => pksService.lockDataPks(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
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

  const handleLockData = () => {
    const data: LockDataRequest = {
      id_trx_pks: idTrxPks,
      bulan: bulan,
      tahun: tahun,
      total_mahasiswa: statistikMahasiswa?.total_mahasiswa ?? 0,
      total_mahasiswa_aktif: statistikMahasiswa?.total_mahasiswa_aktif ?? 0,
      total_mahasiswa_tidak_aktif:
        statistikMahasiswa?.total_mahasiswa_tidak_aktif ?? 0,
      jumlah_nominal: totalBiayaHidup,
    };

    mutation.mutate(data);

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="font-inter">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle>Update Selesai</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Pastikan data berikut sudah benar sebelum mengirim data ke
              verifikatior. Data yang sudah di-update tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4">
            {/* Periode */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Periode</p>
                <p className="font-semibold text-lg">
                  {bulan} {tahun}
                </p>
              </div>
            </div>

            {/* Mahasiswa Aktif */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Mahasiswa Aktif</p>
                <p className="font-semibold text-lg">
                  {statistikMahasiswa?.total_mahasiswa_aktif}
                </p>
              </div>
            </div>

            {/* Mahasiswa Tidak Aktif */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Mahasiswa Tidak Aktif
                </p>
                <p className="font-semibold text-lg">
                  {statistikMahasiswa?.total_mahasiswa_tidak_aktif}
                </p>
              </div>
            </div>

            {/* Total Biaya Hidup */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Total Biaya Hidup
                </p>
                <p className="font-semibold text-lg">
                  {formatRupiah(totalBiayaHidup)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Peringatan
              </p>
              <p className="text-amber-700 dark:text-amber-200">
                Data yang sudah di-update tidak dapat diubah atau dihapus.
                Pastikan semua informasi sudah benar.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleLockData}>
              <Send className="h-4 w-4" />
              Ya, Update Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LoadingDialog open={mutation.isPending} title="Meng-update Data" />
    </>
  );
}
