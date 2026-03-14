import CustBreadcrumb from "@/components/CustBreadCrumb";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useNavigate, useParams } from "react-router-dom";
import CardVerifikasiBeasiswa from "../components/CardVerifikasiBeasiswa";
import FullDataBeasiswaCatatan from "../components/FullDataBeasiswaCatatan";
import FullDataBeasiswa from "../../../components/beasiswa/FullDataBeasiswa";
import { useForm, FormProvider } from "react-hook-form";
import { verifikasiSchema, type VerifikasiFormData } from "@/types/beasiswa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";
import { STALE_TIME } from "@/constants/reactQuery";

const extractErrorMessages = (errors: any, parentKey = ""): string[] => {
  let messages: string[] = [];

  Object.entries(errors).forEach(([key, value]: any) => {
    if (!value) return;

    const fieldPath = parentKey ? `${parentKey}.${key}` : key;

    if (value.message) {
      messages.push(value.message);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        messages.push(...extractErrorMessages(item, `${fieldPath}[${index}]`));
      });
    } else if (typeof value === "object") {
      messages.push(...extractErrorMessages(value, fieldPath));
    }
  });

  return messages;
};

const VIEW_ONLY_FLOWS = [6, 7, 9, 10, 11, 12];

const BeasiswaSeleksiDetailPage = () => {
  useRedirectIfHasNotAccess("U");

  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Fetch data beasiswa untuk cek id_flow
  const { data: fullData } = useQuery({
    queryKey: ["full-data-beasiswa", id],
    queryFn: () => beasiswaService.getFullDataBeasiswa(id),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const idFlow = fullData?.data?.data_beasiswa?.id_flow ?? null;
  const isViewOnly = idFlow !== null && VIEW_ONLY_FLOWS.includes(idFlow);

  // ✅ Gunakan methods object agar bisa di-spread ke FormProvider
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

  const selectedStatus = watch("selectedStatus");

  const mutation = useMutation({
    mutationFn: async (data: VerifikasiFormData) => {
      await beasiswaService.saveCatatanVerifikasi(id, {
        catatan_verifikasi_verifikator: data.catatan ?? undefined,
        verifikator: "ditjenbun",
      });

      return beasiswaService.updateFlowBeasiswa(
        id,
        selectedStatus!,
        data.catatan || "",
        data,
        "ditjenbun",
      );
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        navigate("/beasiswa_seleksi");
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

  const onSubmit = (data: VerifikasiFormData) => {
    const { selectedStatus: _, ...submitData } = data;
    mutation.mutate(submitData);
  };

  return (
    // ✅ Bungkus semua dengan FormProvider agar useFormContext bisa dipakai di child
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
                control={control}
              />
            </div>
          </div>
        )}

        {/* Error Dialog */}
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
