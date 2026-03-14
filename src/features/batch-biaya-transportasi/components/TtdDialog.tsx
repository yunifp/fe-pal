import LoadingDialog from "@/components/LoadingDialog";
import { SignaturePad } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthRole } from "@/hooks/useAuthRole";
import { biayaTransportasiService } from "@/services/biayaTransportasiService";
import {
  ppkBendaharaSchema,
  type PpkBendaharaFormData,
} from "@/types/biayaTransportasi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TtdDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  idBatch: number;
}

const TtdDialog = ({ open, setOpen, idBatch }: TtdDialogProps) => {
  const queryClient = useQueryClient();

  const { isPpk, isBendahara } = useAuthRole();

  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<PpkBendaharaFormData>({
    resolver: zodResolver(ppkBendaharaSchema),
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const handleDownloadNominatifGabungan = async () => {
    try {
      setIsDownloading(true);

      const blob =
        await biayaTransportasiService.generateNominatifGabungan(idBatch);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "Daftar-Nominatif-Gabungan.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      // contoh handling user-friendly
      toast.error("Gagal mengunduh Daftar Nominatif Gabungan");
    } finally {
      setIsDownloading(false);
    }
  };

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: PpkBendaharaFormData) =>
      biayaTransportasiService.ppkBendahara(idBatch, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["batch-biaya-transportasi"],
          exact: false,
        });
        setOpen(false);
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

  const onSubmit = (data: PpkBendaharaFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="font-inter">
          <DialogHeader>
            <DialogTitle>Verifikasi Daftar Nominatif Gabungan</DialogTitle>
            <DialogDescription>
              Isi data di bawah untuk melanjutkan proses pengajuan biaya
              transportasi
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Daftar Nominatif Gabungan</Label>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleDownloadNominatifGabungan}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                {isDownloading ? "Memuat..." : "Unduh"}
              </Button>
            </div>

            {isPpk && (
              <SignaturePad
                label="Tanda Tangan"
                isRequired={true}
                onSave={(ttd_ppk) => setValue("ttd_ppk", ttd_ppk)}
                error={!!errors.ttd_ppk}
                errorMessage={errors?.ttd_ppk?.message}
              />
            )}

            {isBendahara && (
              <SignaturePad
                label="Tanda Tangan"
                isRequired={true}
                onSave={(ttd_bendahara) =>
                  setValue("ttd_bendahara", ttd_bendahara)
                }
                error={!!errors.ttd_bendahara}
                errorMessage={errors?.ttd_bendahara?.message}
              />
            )}

            {/* ACTION */}
            <div className="flex justify-end">
              <Button type="submit">Verifikasi</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingDialog open={mutation.isPending} title="Mengirim data" />
    </>
  );
};

export default TtdDialog;
