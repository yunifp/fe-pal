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
import { Separator } from "@/components/ui/separator";
import { useAuthRole } from "@/hooks/useAuthRole";
import { biayaPendidikanService } from "@/services/biayaPendidikanService";
import {
  ppkBendaharaSchema,
  type PpkBendaharaFormData,
} from "@/types/biayaPendidikan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TtdPimpinanDialogProps {
  idBiayaPendidikan: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TtdPimpinanDialog = ({
  idBiayaPendidikan,
  open,
  setOpen,
}: TtdPimpinanDialogProps) => {
  const queryClient = useQueryClient();

  const { isPpk, isBendahara } = useAuthRole();

  const form = useForm<PpkBendaharaFormData>({
    resolver: zodResolver(ppkBendaharaSchema),
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: PpkBendaharaFormData) =>
      biayaPendidikanService.ppkBendahara(idBiayaPendidikan, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-pendidikan"],
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
              pendidikan
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

export default TtdPimpinanDialog;
