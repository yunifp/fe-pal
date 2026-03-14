import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logPerubahanService } from "@/services/logPerubahanService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";
import ModernTable from "@/components/pks/ModernTable";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Button } from "@/components/ui/button";
import LoadingDialog from "@/components/LoadingDialog";
import { useForm } from "react-hook-form";
import {
  verifikasiStatusAktifSchema,
  type ILogPerubahanIpk,
  type VerifikasiStatusAktifFormData,
} from "@/types/logPerubahan";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CustTextArea } from "@/components/CustTextArea";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  idMahasiswa: number;
  hasPerubahan: boolean;
}

export function PerubahanIpkDialog({
  open,
  setOpen,
  idMahasiswa,
  hasPerubahan,
}: Props) {
  const { isBpdp } = useAuthRole();

  const queryClient = useQueryClient();

  const { data: response } = useQuery({
    queryKey: ["log-perubahan-ipk", idMahasiswa],
    queryFn: () => logPerubahanService.getPerubahanIpk(idMahasiswa),

    enabled: open && !!idMahasiswa, // fetch hanya saat dialog buka
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const logs = response?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifikasiStatusAktifFormData>({
    resolver: zodResolver(verifikasiStatusAktifSchema),
    defaultValues: {
      status: "Disetujui",
      catatan: "",
    },
  });

  const selectedStatus = watch("status");

  const headers = ["Perubahan", "Status", "Catatan", "Dibuat", "Diverifikasi"];

  const rows =
    logs?.map((log) => {
      const perubahanContent = (
        <div className="space-y-2 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
            const sebelumKey = `ipk_s${s}_sebelumnya` as keyof ILogPerubahanIpk;
            const sesudahKey = `ipk_s${s}_pengganti` as keyof ILogPerubahanIpk;

            const sebelum = log[sebelumKey] as number | null;
            const sesudah = log[sesudahKey] as number | null;

            if (sebelum === null && sesudah === null) return null;

            return (
              <div key={s}>
                <span className="font-semibold">Semester {s}:</span>{" "}
                <span className="line-through text-muted-foreground">
                  {sebelum ?? "-"}
                </span>{" "}
                →{" "}
                <span className="text-primary font-semibold">
                  {sesudah ?? "-"}
                </span>
              </div>
            );
          })}
        </div>
      );

      const createdInfo = (
        <div className="text-sm">
          <div className="font-medium">{log.created_by ?? "-"}</div>
          <div className="text-muted-foreground">
            {log.created_at ? formatTanggalJamIndo(log.created_at) : "-"}
          </div>
        </div>
      );

      const verifiedInfo = (
        <div className="text-sm">
          <div className="font-medium">{log.verified_by ?? "-"}</div>
          <div className="text-muted-foreground">
            {log.verified_at ? formatTanggalJamIndo(log.verified_at) : "-"}
          </div>
        </div>
      );

      const statusBadge = (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            log.status === "Disetujui"
              ? "bg-green-100 text-green-700"
              : log.status === "Ditolak"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {log.status ?? "-"}
        </span>
      );

      return [
        perubahanContent,
        statusBadge,
        log.catatan ?? "-",
        createdInfo,
        verifiedInfo,
      ];
    }) ?? [];

  const sortedLogs = [...(logs ?? [])].sort(
    (a, b) =>
      new Date(b.created_at ?? "").getTime() -
      new Date(a.created_at ?? "").getTime(),
  );

  const latestLog = sortedLogs[0];

  const verifikasiMutation = useMutation({
    mutationFn: ({
      idLog,
      status,
      catatan,
    }: {
      idLog: number;
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    }) =>
      logPerubahanService.verifikasiPerubahanIpk(idLog, {
        status,
        catatan,
      }),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["log-perubahan-ipk", idMahasiswa],
      });

      queryClient.invalidateQueries({
        queryKey: ["pks", "mahasiswa"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["pks", "perubahan-data-mahasiswa"],
        exact: false,
      });
      toast.success("Perubahan IPK berhasil diverifikasi");
    },
  });

  const onVerifikasi = (data: {
    status: "Disetujui" | "Ditolak";
    catatan: string | null;
  }) => {
    if (!latestLog?.id) return;

    verifikasiMutation.mutate({
      idLog: latestLog.id,
      status: data.status,
      catatan: data.catatan,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="font-inter max-h-[90vh] overflow-y-auto"
          size="lg"
        >
          <DialogHeader>
            <DialogTitle>Perubahan Status Aktif</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="log" className="w-full">
            <TabsList>
              <TabsTrigger value="log">Log Perubahan</TabsTrigger>
              {isBpdp && hasPerubahan && (
                <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
              )}
            </TabsList>

            {/* ===================== TAB LOG ===================== */}
            <TabsContent value="log">
              <ModernTable
                headers={headers}
                rows={rows}
                emptyMessage="Tidak ada log perubahan"
              />
            </TabsContent>

            {/* ===================== TAB VERIFIKASI ===================== */}
            {isBpdp && hasPerubahan && (
              <TabsContent value="verifikasi">
                <div className="mt-4 space-y-6">
                  {!latestLog && (
                    <p className="text-muted-foreground text-sm">
                      Tidak ada perubahan untuk diverifikasi.
                    </p>
                  )}

                  {latestLog && (
                    <>
                      <div className="space-y-3 text-sm border rounded-lg p-4 bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Pengajuan terakhir:{" "}
                          {formatTanggalJamIndo(latestLog.created_at!)}
                        </div>

                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                          const keySebelum =
                            `ipk_s${s}_sebelumnya` as keyof ILogPerubahanIpk;
                          const keySesudah =
                            `ipk_s${s}_pengganti` as keyof ILogPerubahanIpk;

                          const sebelum = latestLog[keySebelum] as
                            | number
                            | null;
                          const sesudah = latestLog[keySesudah] as
                            | number
                            | null;

                          if (sebelum === null && sesudah === null) return null;

                          return (
                            <div key={s}>
                              <span className="font-semibold">
                                Semester {s}:
                              </span>{" "}
                              <span className="line-through text-muted-foreground">
                                {sebelum ?? "-"}
                              </span>{" "}
                              →{" "}
                              <span className="text-primary font-semibold">
                                {sesudah ?? "-"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* ================= VERIFIKASI FORM ================= */}
                      <form
                        onSubmit={handleSubmit((data) => {
                          onVerifikasi({
                            status: data.status,
                            catatan:
                              data.status === "Ditolak"
                                ? (data.catatan ?? null)
                                : null,
                          });
                        })}
                        className="space-y-4 border rounded-lg p-4"
                      >
                        <RadioGroup
                          value={selectedStatus}
                          onValueChange={(value) =>
                            setValue("status", value as "Disetujui" | "Ditolak")
                          }
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Disetujui" id="setujui" />
                            <Label htmlFor="setujui">Setujui</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Ditolak" id="tolak" />
                            <Label htmlFor="tolak">Tolak</Label>
                          </div>
                        </RadioGroup>

                        {selectedStatus === "Ditolak" && (
                          <div className="space-y-2">
                            <CustTextArea
                              label="Catatan Penolakan"
                              placeholder="Masukkan alasan penolakan..."
                              {...register("catatan")}
                            />
                            {errors.catatan && (
                              <p className="text-sm text-red-500">
                                {errors.catatan.message}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            Simpan Verifikasi
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <LoadingDialog
        open={verifikasiMutation.isPending}
        title="Melakukan verifikasi"
      />
    </>
  );
}
