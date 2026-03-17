/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustInput } from "@/components/CustInput";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/Auth/services/authService";
import { toast } from "sonner";

const forgotPinSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }).min(1, { message: "Email wajib diisi" }),
});

type ForgotPinFormData = z.infer<typeof forgotPinSchema>;

interface ForgotPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPinDialog({ isOpen, onClose }: ForgotPinDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPinFormData>({
    resolver: zodResolver(forgotPinSchema),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => authService.forgotPin(email),
    onSuccess: (res) => {
      toast.success(res?.message || "Tautan reset PIN telah dikirim ke email Anda.");
      reset(); // Kosongkan form
      onClose(); // Tutup modal
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal mengirim email reset PIN.");
    },
  });

  const onSubmit = (data: ForgotPinFormData) => {
    mutation.mutate(data.email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lupa PIN?</DialogTitle>
          <DialogDescription>
            Masukkan alamat email yang terdaftar pada akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang PIN Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <CustInput
            label="Alamat Email"
            type="email"
            id="email"
            placeholder="contoh@email.com"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Mengirim..." : "Kirim Tautan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}