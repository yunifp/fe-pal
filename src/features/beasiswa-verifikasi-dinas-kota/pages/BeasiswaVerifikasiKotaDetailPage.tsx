import CustBreadcrumb from "@/components/CustBreadCrumb";
import { useNavigate, useParams } from "react-router-dom";
import CardVerifikasiBeasiswa from "../components/CardVerifikasiBeasiswa";
import FullDataBeasiswaCatatan from "../components/FullDataBeasiswaCatatan";
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

const BeasiswaVerifikasiKotaDetailPage = () => {
  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // ✅ Gunakan methods object agar bisa di-spread ke FormProvider
  const methods = useForm<VerifikasiFormData>({
    resolver: zodResolver(verifikasiSchema),
    defaultValues: {
      data_pribadi_is_valid: "1",
      data_tempat_tinggal_is_valid: "1",
      data_orang_tua_is_valid: "1",
      data_tempat_bekerja_is_valid: "1",
      data_pendidikan_is_valid: "1",
      data_program_studi_is_valid: "1",
      data_persyaratan_umum: [],
      data_persyaratan_khusus: [],
      data_persyaratan_dinas: [],
      kode_dinas_provinsi: "",
      kode_dinas_kabkota: "",
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

  const { data: fullDataBeasiswa } = useQuery({
    queryKey: ["full-data-beasiswa-parent", id],
    queryFn: async () => {
      const response = await beasiswaService.getFullDataBeasiswa(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Set kode dinas ke form saat data load
  useEffect(() => {
    if (fullDataBeasiswa?.data_beasiswa) {
      const beasiswa = fullDataBeasiswa.data_beasiswa;
      setValue("kode_dinas_provinsi", beasiswa.kode_dinas_provinsi || "");
      setValue("kode_dinas_kabkota", beasiswa.kode_dinas_kabkota || "");
    }
  }, [fullDataBeasiswa, setValue]);

  const selectedStatus = watch("selectedStatus");

  const mutation = useMutation({
    mutationFn: async (data: VerifikasiFormData) => {
      await beasiswaService.saveCatatanVerifikasi(id, {
        catatan_verifikasi_dinas_kabkota: data.catatan ?? undefined,
        verifikator: "dinas_kabkota",
      });

      // 2. Simpan is_valid per dokumen umum
      await beasiswaService.updateDokumenVerifikasiDinas(id, {
        data_persyaratan_umum: data.data_persyaratan_umum,
      });

      const tag = selectedStatus === 7 ? "Y" : "N";
      return beasiswaService.updateTagDinasKabkota(id, tag);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        navigate("/beasiswa_verifikasi_dinas_kota");
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

  const onSubmit = async (data: VerifikasiFormData) => {
    try {
      if (data.selectedStatus === 14 && data._selectedFile) {
        toast.info("Mengupload file...");
        const uploadedUrl = await data._uploadFile(data._selectedFile);
        if (!uploadedUrl) {
          toast.error("Gagal mengupload file. Verifikasi dibatalkan.");
          return;
        }
        data.fileSuratKeputusan = uploadedUrl;
      }

      if (fullDataBeasiswa?.data_beasiswa) {
        const beasiswa = fullDataBeasiswa.data_beasiswa;
        if (beasiswa.kode_dinas_provinsi) {
          data.kode_dinas_provinsi = `${beasiswa.kode_dinas_provinsi}#${beasiswa.nama_dinas_provinsi || ""}`;
        }
        if (beasiswa.kode_dinas_kabkota) {
          data.kode_dinas_kabkota = `${beasiswa.kode_dinas_kabkota}#${beasiswa.nama_dinas_kabkota || ""}`;
        }
      }

      const {
        selectedStatus: _,
        _uploadFile,
        _selectedFile,
        ...submitData
      } = data;
      mutation.mutate(submitData);
    } catch (error) {
      console.error("Error saat submit:", error);
      toast.error("Terjadi kesalahan saat memproses data");
    }
  };

  return (
    // ✅ FormProvider agar useFormContext bisa dipakai di KesesuaianDokumen
    <FormProvider {...methods}>
      <>
        <CustBreadcrumb
          items={[
            {
              name: "Verifikasi Kabupaten / Kota",
              url: "/beasiswa_verifikasi_dinas_kota",
            },
            { name: "Detail", url: "#" },
          ]}
        />

        <p className="text-xl font-semibold mt-4">
          Seleksi Administratif Kabupaten / Kota
        </p>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/*
              ✅ Pass verifikatorMode="dinas" ke FullDataBeasiswaCatatan
              agar KesesuaianDokumen di dalamnya pre-populate dari
              verifikator_dinas_is_valid bukan status_verifikasi ditjenbun
            */}
            <FullDataBeasiswaCatatan
              idTrxBeasiswa={id}
              register={register}
              control={control}
              errors={errors}
              verifikatorMode="dinas"
            />
          </div>

          <div className="lg:col-span-1">
            <CardVerifikasiBeasiswa
              onSubmit={handleSubmit(onSubmit)}
              idTrxBeasiswa={id}
              register={register}
              errors={errors}
              reset={reset}
              setValue={setValue}
              watch={watch}
              getValues={getValues}
            />
          </div>
        </div>

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

export default BeasiswaVerifikasiKotaDetailPage;
