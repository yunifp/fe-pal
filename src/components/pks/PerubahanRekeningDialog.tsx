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
import { Download } from "lucide-react";
import ModernTable from "@/components/pks/ModernTable";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Button } from "@/components/ui/button";
import LoadingDialog from "@/components/LoadingDialog";
import { useForm } from "react-hook-form";
import {
  verifikasiRekeningSchema,
  type VerifikasiRekeningFormData,
} from "@/types/logPerubahan";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CustTextArea } from "@/components/CustTextArea";
import { toast } from "sonner";
import { STALE_TIME } from "@/constants/reactQuery";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  idMahasiswa: number;
  hasPerubahan: boolean;
}

export function PerubahanRekeningDialog({
  open,
  setOpen,
  idMahasiswa,
  hasPerubahan,
}: Props) {
  const { isBpdp } = useAuthRole();

  const queryClient = useQueryClient();

  const { data: response } = useQuery({
    queryKey: ["log-perubahan-rekening", idMahasiswa],
    queryFn: () => logPerubahanService.getPerubahanRekening(idMahasiswa),
    enabled: open && !!idMahasiswa, // fetch hanya saat dialog buka
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const logs = response?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifikasiRekeningFormData>({
    resolver: zodResolver(verifikasiRekeningSchema),
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
          {(log.nama_bank_sebelumnya || log.nama_bank_pengganti) && (
            <div>
              <span className="font-semibold">Bank:</span>{" "}
              <span className="line-through text-muted-foreground">
                {log.nama_bank_sebelumnya ?? "-"}
              </span>{" "}
              →{" "}
              <span className="text-primary font-semibold">
                {log.nama_bank_pengganti ?? "-"}
              </span>
            </div>
          )}

          {(log.nomor_rekening_sebelumnya || log.nomor_rekening_pengganti) && (
            <div>
              <span className="font-semibold">No Rekening:</span>{" "}
              <span className="line-through text-muted-foreground">
                {log.nomor_rekening_sebelumnya ?? "-"}
              </span>{" "}
              →{" "}
              <span className="text-primary font-semibold">
                {log.nomor_rekening_pengganti ?? "-"}
              </span>
            </div>
          )}

          {(log.nama_rekening_sebelumnya || log.nama_rekening_pengganti) && (
            <div>
              <span className="font-semibold">Nama Rekening:</span>{" "}
              <span className="line-through text-muted-foreground">
                {log.nama_rekening_sebelumnya ?? "-"}
              </span>{" "}
              →{" "}
              <span className="text-primary font-semibold">
                {log.nama_rekening_pengganti ?? "-"}
              </span>
            </div>
          )}

          {(log.scan_buku_tabungan_sebelumnya ||
            log.scan_buku_tabungan_pengganti) && (
            <div className="flex items-center gap-3">
              <span className="font-semibold">Scan:</span>

              {log.scan_buku_tabungan_sebelumnya && (
                <a
                  href={log.scan_buku_tabungan_sebelumnya}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                >
                  <Download className="h-3 w-3" />
                  Lama
                </a>
              )}

              {log.scan_buku_tabungan_pengganti && (
                <a
                  href={log.scan_buku_tabungan_pengganti}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" />
                  Baru
                </a>
              )}
            </div>
          )}
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
        perubahanContent, // 1. Perubahan
        statusBadge, // 2. Status
        log.catatan ?? "-", // 3. Catatan
        createdInfo, // 4. Dibuat oleh & kapan
        verifiedInfo, // 5. Diverifikasi oleh & kapan
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
      logPerubahanService.verifikasiPerubahanRekening(idLog, {
        status,
        catatan,
      }),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["log-perubahan-rekening", idMahasiswa],
      });

      queryClient.invalidateQueries({
        queryKey: ["pks", "perubahan-data-mahasiswa"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["pks", "mahasiswa"],
        exact: false,
      });
      toast.success("Perubahan rekening berhasil diverifikasi");
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
            <DialogTitle>Perubahan Rekening</DialogTitle>
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

                        {/* BANK */}
                        {(latestLog.nama_bank_sebelumnya ||
                          latestLog.nama_bank_pengganti) && (
                          <div>
                            <span className="font-semibold">Bank:</span>{" "}
                            <span className="line-through text-muted-foreground">
                              {latestLog.nama_bank_sebelumnya ?? "-"}
                            </span>{" "}
                            →{" "}
                            <span className="text-primary font-semibold">
                              {latestLog.nama_bank_pengganti ?? "-"}
                            </span>
                          </div>
                        )}

                        {/* NO REKENING */}
                        {(latestLog.nomor_rekening_sebelumnya ||
                          latestLog.nomor_rekening_pengganti) && (
                          <div>
                            <span className="font-semibold">No Rekening:</span>{" "}
                            <span className="line-through text-muted-foreground">
                              {latestLog.nomor_rekening_sebelumnya ?? "-"}
                            </span>{" "}
                            →{" "}
                            <span className="text-primary font-semibold">
                              {latestLog.nomor_rekening_pengganti ?? "-"}
                            </span>
                          </div>
                        )}

                        {/* NAMA REKENING */}
                        {(latestLog.nama_rekening_sebelumnya ||
                          latestLog.nama_rekening_pengganti) && (
                          <div>
                            <span className="font-semibold">
                              Nama Rekening:
                            </span>{" "}
                            <span className="line-through text-muted-foreground">
                              {latestLog.nama_rekening_sebelumnya ?? "-"}
                            </span>{" "}
                            →{" "}
                            <span className="text-primary font-semibold">
                              {latestLog.nama_rekening_pengganti ?? "-"}
                            </span>
                          </div>
                        )}

                        {/* SCAN */}
                        {latestLog.scan_buku_tabungan_pengganti && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Scan Baru:</span>
                            <a
                              href={latestLog.scan_buku_tabungan_pengganti}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>

                      {/* VERIFIKASI FORM */}
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
                        {/* Radio Status */}
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

                        {/* Catatan jika ditolak */}
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
