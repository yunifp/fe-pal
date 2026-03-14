import { CustTextArea } from "@/components/CustTextArea";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { biayaBukuService } from "@/services/biayaBukuService";
import {
  verifikatorPjkSchema,
  type ITrxBiayaBukuPksWithPks,
  type VerifikatorPjkFormData,
} from "@/types/biayaBuku";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Eye, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  dataBiayaBuku?: ITrxBiayaBukuPksWithPks | null;
}

const VerifikatorPjkDialog = ({ open, setOpen, dataBiayaBuku }: Props) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<VerifikatorPjkFormData>({
    resolver: zodResolver(verifikatorPjkSchema),
  });

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = form;

  const verifikasi = watch("verifikasi");

  const handleDownloadRab = async () => {
    try {
      setIsDownloading(true);

      const blob = await biayaBukuService.generateRab(dataBiayaBuku?.id!!);

      const url = window.URL.createObjectURL(blob);

      // buka di tab baru
      window.open(url, "_blank");

      // revoke setelah beberapa detik biar aman
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error: any) {
      toast.error("Gagal menampilkan RAB");
    } finally {
      setIsDownloading(false);
    }
  };

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: VerifikatorPjkFormData) =>
      biayaBukuService.verifikatorPjk(dataBiayaBuku?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["pengajuan-biaya-buku"] });
        queryClient.invalidateQueries({
          queryKey: ["log-pengajuan", "biaya-buku", dataBiayaBuku?.id],
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

  const onSubmit = (data: VerifikatorPjkFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="font-inter">
          <DialogHeader>
            <DialogTitle>Verifikasi Form Monitoring RAB</DialogTitle>
            <DialogDescription>
              Isi data di bawah untuk melanjutkan proses pengajuan biaya buku
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Form Monitoring RAB</Label>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleDownloadRab}
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

            <div className="space-y-2">
              <Label>
                Hasil Verifikasi
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <RadioGroup
                value={verifikasi}
                onValueChange={(value) =>
                  setValue("verifikasi", value as "setuju" | "kembalikan", {
                    shouldValidate: true,
                  })
                }
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="setuju" id="setuju" />
                  <Label
                    htmlFor="setuju"
                    className="font-normal cursor-pointer"
                  >
                    Setuju
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kembalikan" id="kembalikan" />
                  <Label
                    htmlFor="kembalikan"
                    className="font-normal cursor-pointer"
                  >
                    Kembalikan
                  </Label>
                </div>
              </RadioGroup>
              {errors.verifikasi && (
                <p className="text-sm text-destructive">
                  {errors.verifikasi.message}
                </p>
              )}
            </div>

            {verifikasi === "kembalikan" && (
              <>
                <CustTextArea
                  label="Catatan Revisi"
                  id="catatan_revisi"
                  placeholder="Masukkan catatan revisi"
                  isRequired
                  error={!!errors.catatan_revisi}
                  errorMessage={errors.catatan_revisi?.message}
                  {...register("catatan_revisi")}
                />
                {errors.catatan_revisi && (
                  <p className="text-sm text-destructive">
                    {errors.catatan_revisi.message}
                  </p>
                )}
              </>
            )}

            {verifikasi == "setuju" && (
              <>
                <div className="border-t pt-6">
                  {/* Section Header Signature */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tanda Tangan Persetujuan
                    </h3>
                    <p className="text-sm text-gray-500">
                      Bubuhkan tanda tangan Anda untuk menyetujui
                    </p>
                  </div>

                  {/* Signature Pad - Full width atau max-width */}
                  <div className="max-w-md">
                    <SignaturePad
                      label="Tanda Tangan"
                      isRequired={true}
                      onSave={(ttd) => setValue("ttd", ttd)}
                      error={!!errors.ttd}
                      errorMessage={errors?.ttd?.message}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ACTION */}
            <div className="flex justify-end">
              <Button type="submit">
                <CircleCheck className="h-4 w-4" />
                Verifikasi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingDialog open={mutation.isPending} title="Mengirim data" />
    </>
  );
};

export default VerifikatorPjkDialog;
