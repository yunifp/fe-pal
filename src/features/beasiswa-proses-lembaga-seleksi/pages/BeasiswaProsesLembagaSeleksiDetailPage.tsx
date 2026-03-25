/* eslint-disable @typescript-eslint/no-unused-vars */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useParams } from "react-router-dom";
import CardVerifikasiBeasiswa from "../components/CardVerifikasiBeasiswa";
import FullDataBeasiswaCatatan from "../components/FullDataBeasiswaCatatan";
import FullDataBeasiswa from "../../../components/beasiswa/FullDataBeasiswa";
import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { verifikasiSchema, type VerifikasiFormData } from "@/types/beasiswa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";

// ── Tipe pilihan keputusan ────────────────────────────────────────────────────
type KeputusanType = "lulus" | "tidak_lulus" | "mengundurkan_diri";

interface KeputusanConfig {
  type: KeputusanType;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: "default" | "destructive" | "outline";
  confirmClass: string;
}

const KEPUTUSAN_CONFIG: KeputusanConfig[] = [
  {
    type: "lulus",
    label: "Lulus Verifikasi",
    description:
      "Pendaftar dinyatakan LULUS verifikasi dan dapat melanjutkan ke tahap berikutnya.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    variant: "default",
    confirmClass:
      "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
  },
  {
    type: "tidak_lulus",
    label: "Tidak Lulus Verifikasi",
    description:
      "Pendaftar dinyatakan TIDAK LULUS verifikasi dan tidak dapat melanjutkan ke tahap berikutnya.",
    icon: <XCircle className="h-5 w-5" />,
    variant: "destructive",
    confirmClass: "bg-destructive hover:bg-destructive/90 text-white",
  },
  {
    type: "mengundurkan_diri",
    label: "Mengundurkan Diri",
    description:
      "Pendaftar dinyatakan MENGUNDURKAN DIRI dari program beasiswa ini.",
    icon: <LogOut className="h-5 w-5" />,
    variant: "outline",
    confirmClass:
      "bg-amber-500 hover:bg-amber-600 text-white border-transparent",
  },
];

// ── Helper: ekstrak pesan error dari react-hook-form ─────────────────────────
const extractErrorMessages = (
  errors: FieldErrors<VerifikasiFormData>,
  parentKey = "",
): string[] => {
  const messages: string[] = [];

  Object.entries(errors as Record<string, unknown>).forEach(([key, value]) => {
    if (!value) return;

    const fieldPath = parentKey ? `${parentKey}.${key}` : key;
    const typedValue = value as Record<string, unknown>;

    if (typeof typedValue.message === "string") {
      messages.push(typedValue.message);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        messages.push(
          ...extractErrorMessages(
            item as FieldErrors<VerifikasiFormData>,
            `${fieldPath}[${index}]`,
          ),
        );
      });
    } else if (typeof value === "object") {
      messages.push(
        ...extractErrorMessages(
          value as FieldErrors<VerifikasiFormData>,
          fieldPath,
        ),
      );
    }
  });

  return messages;
};

const VIEW_ONLY_FLOWS = [6, 7, 9, 10, 11, 12, 13];

// ── Map keputusan ke flow ID yang dikirim ke API ──────────────────────────────
const KEPUTUSAN_TO_FLOW: Record<KeputusanType, number> = {
  lulus: 11, // sesuaikan dengan flow ID di sistem
  tidak_lulus: 3, // sesuaikan dengan flow ID di sistem
  mengundurkan_diri: 3, // sesuaikan dengan flow ID di sistem
};

// ─────────────────────────────────────────────────────────────────────────────

const BeasiswaSeleksiDetailPage = () => {
  useRedirectIfHasNotAccess("U");

  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "");


  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [pendingKeputusan, setPendingKeputusan] =
    useState<KeputusanType | null>(null);

  // ── Fetch data beasiswa untuk cek id_flow ─────────────────────────────
  const { data: fullData } = useQuery({
    queryKey: ["full-data-beasiswa", id],
    queryFn: () => beasiswaService.getFullDataBeasiswa(id),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const idFlow = fullData?.data?.data_beasiswa?.id_flow ?? null;
  const isViewOnly = idFlow !== null && VIEW_ONLY_FLOWS.includes(idFlow);

  const methods = useForm<VerifikasiFormData>({
    resolver: zodResolver(verifikasiSchema),
    defaultValues: {
      data_pribadi_is_valid: "",
      data_tempat_tinggal_is_valid: "",
      data_orang_tua_is_valid: "",
      data_tempat_bekerja_is_valid: "",
      data_pendidikan_is_valid: "",
      data_persyaratan_umum: [],
      data_persyaratan_khusus: [],
      data_persyaratan_dinas: [
        {
          kategori: "Dinas",
          is_valid: "Y",
          catatan: "",
          id: "",
        },
      ],
    },
    shouldUnregister: false,
  });

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
  } = methods;

  const errorMessages = extractErrorMessages(errors);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setShowErrorDialog(true);
    }
  }, [errors]);


  // ── Konfig dialog konfirmasi berdasarkan keputusan yang dipilih ───────
  const activeConfig = pendingKeputusan
    ? (KEPUTUSAN_CONFIG.find((k) => k.type === pendingKeputusan) ?? null)
    : null;

  // ── Mutation ──────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data: VerifikasiFormData) => {
      await beasiswaService.saveCatatanVerifikasi(id, {
        catatan_verifikasi_verifikator: data.catatan ?? undefined,
        verifikator: "ditjenbun",
      });
      // console.log(selectedStatus);

      // return beasiswaService.updateFlowBeasiswa(
      //   id,
      //   selectedStatus!,
      //   data.catatan || "",
      //   data,
      //   "ditjenbun",
      // );
      // },
      // onSuccess: (res) => {
      //   if (res.success) {
      //     toast.success(res.message);
      //     queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
      //     navigate("/beasiswa_seleksi");
      //   } else {
      //     toast.error(res.message);
      //   }
      // },
      // onError: (error: unknown) => {
      //   const errResponse = (
      //     error as { response?: { data?: { message?: string } } }
      //   )?.response;
      //   if (errResponse?.data?.message) {
      //     toast.error(errResponse.data.message);
      //   } else {
      //     toast.error("Terjadi kesalahan saat menyimpan data");
      //   }
    },
  });

  // ── Handler: klik salah satu tombol keputusan ─────────────────────────
  const handleKeputusanClick = (type: KeputusanType) => {
    // Set flow sesuai keputusan sebelum membuka dialog
    setValue("selectedStatus", KEPUTUSAN_TO_FLOW[type]);
    setPendingKeputusan(type);
  };

  // ── Handler: konfirmasi di dialog ─────────────────────────────────────
  const handleConfirm = () => {
    setPendingKeputusan(null);
    handleSubmit(onSubmit)();
  };

  const onSubmit = (data: VerifikasiFormData) => {
    const submitData = { ...data };
    delete submitData.selectedStatus;
    console.log(submitData);

    // mutation.mutate(submitData);
  };

  return (
    <FormProvider {...methods}>
      <>
        <CustBreadcrumb
          items={[
            { name: "Seleksi Administratif", url: "/beasiswa_seleksi" },
            { name: "Detail", url: "#" },
          ]}
        />

        <p className="text-xl font-semibold mt-4">Seleksi Administratif</p>

        {isViewOnly ? (
          <div className="mt-3">
            <FullDataBeasiswa idTrxBeasiswa={id} />
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <FullDataBeasiswaCatatan
                  idTrxBeasiswa={id}
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>

              <div className="lg:col-span-1">
                <CardVerifikasiBeasiswa
                  onSubmit={handleSubmit(onSubmit)}
                  register={register}
                  errors={errors}
                  reset={reset}
                  setValue={setValue}
                  watch={watch}
                  getValues={getValues}
                />
              </div>
            </div>

            {/* ── Button Group Keputusan ── */}
            <div className="mt-6 rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">
                  Keputusan Verifikasis
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih keputusan untuk pendaftar ini
                </p>
              </div>
              <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">
                {KEPUTUSAN_CONFIG.map((config) => (
                  <button
                    key={config.type}
                    type="button"
                    onClick={() => handleKeputusanClick(config.type)}
                    disabled={mutation.isPending}
                    className={[
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150",
                      config.type === "lulus"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                        : config.type === "tidak_lulus"
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
                          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
                      mutation.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                    ].join(" ")}>
                    {config.icon}
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Dialog Konfirmasi Keputusan ── */}
        {activeConfig && (
          <Dialog
            open={!!pendingKeputusan}
            onOpenChange={(open) => {
              if (!open) setPendingKeputusan(null);
            }}>
            <DialogContent className="sm:max-w-md font-inter">
              <DialogHeader>
                <DialogTitle
                  className={[
                    "flex items-center gap-2",
                    activeConfig.type === "lulus"
                      ? "text-emerald-700"
                      : activeConfig.type === "tidak_lulus"
                        ? "text-destructive"
                        : "text-amber-600",
                  ].join(" ")}>
                  {activeConfig.icon}
                  Konfirmasi: {activeConfig.label}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground pt-1">
                  {activeConfig.description}
                </DialogDescription>
              </DialogHeader>

              <div
                className={[
                  "rounded-lg border px-4 py-3 text-sm",
                  activeConfig.type === "lulus"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : activeConfig.type === "tidak_lulus"
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-amber-200 bg-amber-50 text-amber-800",
                ].join(" ")}>
                Tindakan ini tidak dapat dibatalkan. Pastikan keputusan Anda
                sudah benar sebelum melanjutkan.
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setPendingKeputusan(null)}
                  disabled={mutation.isPending}>
                  Batal
                </Button>
                <Button
                  className={activeConfig.confirmClass}
                  onClick={handleConfirm}
                  disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {activeConfig.icon}
                      Ya, {activeConfig.label}
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ── Dialog Error Validasi Form ── */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md font-inter">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Form Belum Sesuai
              </DialogTitle>
              <DialogDescription>
                Mohon sesuaikan field berikut sebelum melanjutkan:
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto">
              <ul className="space-y-2">
                {errorMessages.map((msg, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm border-l-2 border-destructive pl-3 py-1">
                    <span className="text-muted-foreground">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </FormProvider>
  );
};

export default BeasiswaSeleksiDetailPage;
