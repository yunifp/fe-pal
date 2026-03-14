import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/utils/stringFormatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { biayaSertifikasiService } from "@/services/biayaSertifikasiService";
import { toast } from "sonner";
import LoadingDialog from "@/components/LoadingDialog";
import type { BatchItem } from "@/types/biayaSertifikasi";

type BatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBatch: BatchItem[];
  resetSelectedBatch: () => void;
};

type BatchCodeResult = {
  code: string | null;
  message: string;
};

export function generateBatchCode(selectedBatch: BatchItem[]): BatchCodeResult {
  if (selectedBatch.length === 0) {
    return { code: null, message: "Tidak ada batch terpilih" };
  }

  const first = selectedBatch[0];
  const { tahun, jenjang } = first;

  const allSame = selectedBatch.every(
    (item) => item.tahun === tahun && item.jenjang === jenjang,
  );

  if (!allSame) {
    return {
      code: null,
      message:
        "Batch tidak bisa digenerate: Tahun, Semester, atau Jenjang berbeda",
    };
  }

  if (!tahun || !jenjang) {
    return {
      code: null,
      message: "Batch tidak bisa digenerate: Data tidak lengkap",
    };
  }

  const jenjangMap: Record<string, string> = {
    D1: "01",
    D2: "02",
    D3: "03",
    D4: "04",
    S1: "05",
  };

  const jenjangCode = jenjangMap[jenjang];
  if (!jenjangCode) {
    return {
      code: null,
      message: "Batch tidak bisa digenerate: Jenjang tidak valid",
    };
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const year = String(tahun).slice(-2);

  const batchCode = `${year}${day}${jenjangCode}`;

  return {
    code: batchCode,
    message: "Berhasil: Semua data konsisten",
  };
}

export function BatchDialog({
  open,
  onOpenChange,
  selectedBatch,
  resetSelectedBatch,
}: BatchDialogProps) {
  const queryClient = useQueryClient();
  const batchResult = generateBatchCode(selectedBatch);
  const isBatchValid = batchResult.code !== null;

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: { kode_batch: string; ids: string }) =>
      biayaSertifikasiService.batchBiayaSertifikasi(data.kode_batch, data.ids),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-sertifikasi"],
        });
        queryClient.invalidateQueries({
          queryKey: ["log-pengajuan", "biaya-sertifikasi"],
          exact: false,
        });
        onOpenChange(false);
        resetSelectedBatch();
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

  const handleSubmit = () => {
    const ids = selectedBatch.map((item) => item.id).join(",");

    if (isBatchValid) {
      mutation.mutate({ kode_batch: batchResult.code ?? "", ids });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto font-inter">
          <DialogHeader>
            <DialogTitle>Batch Pengajuan Biaya Sertifikasi</DialogTitle>
            <DialogDescription>
              Data berikut akan diproses dalam satu batch. Saat ini batch
              bersifat informatif dan belum melakukan aksi final.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {/* Info Kode Batch */}
            <div className="mt-4 space-y-1">
              <p className="font-medium">
                Kode Batch:
                <span className={`ml-2`}>{batchResult.code ?? "—"}</span>
              </p>
              <p
                className={`text-sm ${isBatchValid ? "text-green-600" : "text-red-600"}`}
              >
                Status: {batchResult.message}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Total Data Terpilih:
                <Badge variant="secondary" className="ml-2">
                  {selectedBatch.length}
                </Badge>
              </p>

              <div className="rounded-md border">
                <div className="p-3 border-b bg-muted/30">
                  <p className="text-muted-foreground text-xs font-medium">
                    Pengajuan Terpilih
                  </p>
                </div>
                <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedBatch.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="font-medium text-sm">
                              {item.lembaga_pendidikan}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Nomor PKS:</span>
                              <span>{item.no_pks}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Jenjang:</span>
                              <span>{item.jenjang}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Periode:</span>
                              <span>{item.tahun}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Mahasiswa:</span>
                              <span>{item.total_mahasiswa} orang</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">
                            {formatRupiah(item.jumlah!!)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
            <Button onClick={handleSubmit} disabled={!isBatchValid}>
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoadingDialog open={mutation.isPending} title="Menyimpan data" />
    </>
  );
}
