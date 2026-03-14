import { type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { biayaBukuService } from "@/services/biayaBukuService";
import { ajukanBpdpSchema, type AjukanBpdpFormValues } from "@/types/biayaBuku";
import LoadingDialog from "@/components/LoadingDialog";

interface AjukanBpdpDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  idPengajuan: number | null;
}

export const AjukanBpdpDialog: FC<AjukanBpdpDialogProps> = ({
  open,
  setOpen,
  idPengajuan,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<AjukanBpdpFormValues>({
    resolver: zodResolver(ajukanBpdpSchema),
    defaultValues: {
      verifikasi: undefined,
      catatanRevisi: "",
    },
  });

  const { watch, handleSubmit, register, formState } = form;
  const { errors } = formState;

  const verifikasi = watch("verifikasi");

  const mutation = useMutation({
    mutationFn: (payload: {
      idPengajuan: number;
      verifikasi: string;
      catatanRevisi?: string;
    }) => biayaBukuService.ajukanKeBpdp(payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-buku"],
        });
        queryClient.invalidateQueries({
          queryKey: ["log-pengajuan", "biaya-buku", idPengajuan],
        });
        setOpen(false);
        form.reset();
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Terjadi kesalahan saat mengajukan ke BPDP",
      );
    },
  });

  const onSubmit = (data: AjukanBpdpFormValues) => {
    if (!idPengajuan) return;

    mutation.mutate({
      idPengajuan,
      verifikasi: data.verifikasi,
      catatanRevisi: data.catatanRevisi,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm" className="font-inter">
          <DialogHeader>
            <DialogTitle>Verifikasi Pengajuan BPDP</DialogTitle>
            <DialogDescription>
              Pilih hasil verifikasi pengajuan biaya buku.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Radio Verifikasi */}
            <div className="space-y-2">
              <Label>Hasil Verifikasi</Label>
              <RadioGroup
                value={verifikasi}
                onValueChange={(value) =>
                  form.setValue("verifikasi", value as any)
                }
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="setuju" id="setuju" />
                  <Label htmlFor="setuju">Setuju</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kembalikan" id="kembalikan" />
                  <Label htmlFor="kembalikan">Kembalikan</Label>
                </div>
              </RadioGroup>
              {errors.verifikasi && (
                <p className="text-sm text-destructive">
                  {errors.verifikasi.message}
                </p>
              )}
            </div>

            {/* Catatan Revisi */}
            {verifikasi === "kembalikan" && (
              <div className="space-y-2">
                <Label>Catatan Revisi</Label>
                <Textarea
                  placeholder="Tuliskan alasan pengembalian / revisi..."
                  {...register("catatanRevisi")}
                />
                {errors.catatanRevisi && (
                  <p className="text-sm text-destructive">
                    {errors.catatanRevisi.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Send className="w-4 h-4 mr-1" />
                Simpan Verifikasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingDialog open={mutation.isPending} title="Melakukan verifikasi" />
    </>
  );
};

export default AjukanBpdpDialog;
