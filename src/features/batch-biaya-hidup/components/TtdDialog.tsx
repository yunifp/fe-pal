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
import { biayaHidupService } from "@/services/biayaHidupService";
import {
  ppkBendaharaSchema,
  type PpkBendaharaFormData,
} from "@/types/biayaHidup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader } from "lucide-react";
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

      const response =
        await biayaHidupService.generateNominatifGabungan(idBatch);

      const blob = new Blob([response.data], { type: "application/pdf" });

      const contentDisposition = response.headers["content-disposition"];

      let filename = "daftar-nominatif.pdf";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+\.pdf)"?/i);
        if (match?.[1]) {
          filename = match[1].trim(); // pastikan tidak ada spasi di awal/akhir
        }
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Gagal download file", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: PpkBendaharaFormData) =>
      biayaHidupService.ppkBendahara(idBatch, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["batch-biaya-hidup"],
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
              Isi data di bawah untuk melanjutkan proses pengajuan biaya hidup
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
                  <Eye className="w-4 h-4 mr-1" />
                )}
                {isDownloading ? "Memuat..." : "Preview"}
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
