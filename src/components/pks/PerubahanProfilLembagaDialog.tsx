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
  verifikasiPtSchema,
  type VerifikasiPtFormData,
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
  idPt: number;
  hasPerubahan: boolean;
}

export function PerubahanProfilLembagaDialog({
  open,
  setOpen,
  idPt,
  hasPerubahan,
}: Props) {
  const { isBpdp } = useAuthRole();
  const queryClient = useQueryClient();

  const { data: response } = useQuery({
    queryKey: ["log-perubahan-pt", idPt],
    queryFn: () => logPerubahanService.getPerubahanPt(idPt),
    enabled: open && !!idPt,
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
    formState: { isSubmitting },
  } = useForm<VerifikasiPtFormData>({
    resolver: zodResolver(verifikasiPtSchema),
    defaultValues: {
      status: "Disetujui",
      catatan: "",
    },
  });

  const selectedStatus = watch("status");

  const headers = ["Perubahan", "Status", "Catatan", "Dibuat", "Diverifikasi"];

  // =========================
  // MAPPING FIELD PERUBAHAN
  // =========================
  const fieldMap = [
    { label: "Logo", old: "logo_sebelumnya", new: "logo_pengganti" },
    { label: "Nama", old: "nama_sebelumnya", new: "nama_pengganti" },
    { label: "Kode", old: "kode_sebelumnya", new: "kode_pengganti" },
    {
      label: "Singkatan",
      old: "singkatan_sebelumnya",
      new: "singkatan_pengganti",
    },
    { label: "Jenis", old: "jenis_sebelumnya", new: "jenis_pengganti" },
    { label: "Alamat", old: "alamat_sebelumnya", new: "alamat_pengganti" },
    { label: "Kota", old: "kota_sebelumnya", new: "kota_pengganti" },
    {
      label: "Kode Pos",
      old: "kode_pos_sebelumnya",
      new: "kode_pos_pengganti",
    },
    {
      label: "No Telepon",
      old: "no_telepon_sebelumnya",
      new: "no_telepon_pengganti",
    },
    { label: "Fax", old: "fax_sebelumnya", new: "fax_pengganti" },
    { label: "Email", old: "email_sebelumnya", new: "email_pengganti" },
    { label: "Website", old: "website_sebelumnya", new: "website_pengganti" },
    {
      label: "Nama Pimpinan",
      old: "nama_pimpinan_sebelumnya",
      new: "nama_pimpinan_pengganti",
    },
    {
      label: "No Telp Pimpinan",
      old: "no_telepon_pimpinan_sebelumnya",
      new: "no_telepon_pimpinan_pengganti",
    },
    {
      label: "Jabatan Pimpinan",
      old: "jabatan_pimpinan_sebelumnya",
      new: "jabatan_pimpinan_pengganti",
    },
    {
      label: "No Rekening",
      old: "no_rekening_sebelumnya",
      new: "no_rekening_pengganti",
    },
    {
      label: "Nama Bank",
      old: "nama_bank_sebelumnya",
      new: "nama_bank_pengganti",
    },
    {
      label: "Penerima Transfer",
      old: "penerima_transfer_sebelumnya",
      new: "penerima_transfer_pengganti",
    },
    { label: "NPWP", old: "npwp_sebelumnya", new: "npwp_pengganti" },
  ];

  const renderPerubahan = (log: any) => (
    <div className="space-y-3 text-sm">
      {fieldMap.map((field) => {
        const oldValue = log[field.old];
        const newValue = log[field.new];

        if (!oldValue && !newValue) return null;

        const isLogo = field.label === "Logo";

        return (
          <div key={field.label} className="space-y-1">
            <div className="font-semibold">{field.label}:</div>

            {isLogo ? (
              <div className="flex items-start gap-4">
                {/* OLD LOGO */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">
                    Sebelumnya
                  </span>
                  {oldValue ? (
                    <img
                      src={oldValue}
                      alt="Logo Sebelumnya"
                      className="w-20 h-20 object-contain border rounded-md opacity-60"
                    />
                  ) : (
                    "-"
                  )}
                </div>

                <span className="text-muted-foreground">→</span>

                {/* NEW LOGO */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">
                    Pengganti
                  </span>
                  {newValue ? (
                    <img
                      src={newValue}
                      alt="Logo Pengganti"
                      className="w-20 h-20 object-contain border rounded-md"
                    />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            ) : (
              <div>
                <span className="line-through text-muted-foreground">
                  {oldValue ?? "-"}
                </span>{" "}
                →{" "}
                <span className="text-primary font-semibold">
                  {newValue ?? "-"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const rows =
    logs?.map((log) => {
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
        renderPerubahan(log),
        statusBadge,
        log.catatan ?? "-",
        <div className="text-sm">
          <div className="font-medium">{log.created_by ?? "-"}</div>
          <div className="text-muted-foreground">
            {log.created_at ? formatTanggalJamIndo(log.created_at) : "-"}
          </div>
        </div>,
        <div className="text-sm">
          <div className="font-medium">{log.verified_by ?? "-"}</div>
          <div className="text-muted-foreground">
            {log.verified_at ? formatTanggalJamIndo(log.verified_at) : "-"}
          </div>
        </div>,
      ];
    }) ?? [];

  const sortedLogs = [...logs].sort(
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
      logPerubahanService.verifikasiPerubahanPt(idLog, {
        status,
        catatan,
      }),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["log-perubahan-pt", idPt],
      });
      queryClient.invalidateQueries({
        queryKey: ["perubahan-data-lembaga-pendidikan"],
      });
      toast.success("Perubahan profil lembaga berhasil diverifikasi");
    },
  });

  const onVerifikasi = (data: VerifikasiPtFormData) => {
    if (!latestLog?.id) return;

    verifikasiMutation.mutate({
      idLog: latestLog.id,
      status: data.status,
      catatan: data.status === "Ditolak" ? (data.catatan ?? null) : null,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto font-inter"
          size="lg"
        >
          <DialogHeader>
            <DialogTitle>Perubahan Profil Perguruan Tinggi</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="log">
            <TabsList>
              <TabsTrigger value="log">Log Perubahan</TabsTrigger>
              {isBpdp && hasPerubahan && (
                <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="log">
              <ModernTable
                headers={headers}
                rows={rows}
                emptyMessage="Tidak ada log perubahan"
              />
            </TabsContent>

            {isBpdp && hasPerubahan && (
              <TabsContent value="verifikasi">
                {latestLog && (
                  <div className="space-y-6 mt-4">
                    <div className="border rounded-lg p-4 bg-muted/30">
                      {renderPerubahan(latestLog)}
                    </div>

                    <form
                      onSubmit={handleSubmit(onVerifikasi)}
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
                        <CustTextArea
                          label="Catatan Penolakan"
                          {...register("catatan")}
                        />
                      )}

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          Simpan Verifikasi
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
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
