import CustBreadcrumb from "@/components/CustBreadCrumb";
// import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useNavigate, useParams } from "react-router-dom";
import CardVerifikasiBeasiswa from "../components/CardVerifikasiBeasiswa";
import FullDataBeasiswaCatatan from "../components/FullDataBeasiswaCatatan";
import { useForm } from "react-hook-form";
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

const BeasiswaVerifikasiProvinsiDetailPage = () => {
  // useRedirectIfHasNotAccess("U");

  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<VerifikasiFormData>({
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

  const errorMessages = extractErrorMessages(errors);

  const { data: fullDataBeasiswa } = useQuery({
    queryKey: ["full-data-beasiswa-parent", id], // ← Tambahkan "-parent"
    queryFn: async () => {
      const response = await beasiswaService.getFullDataBeasiswa(id);
      return response.data;
    },
    enabled: !!id,
  });

  // ✅ Set data ke form saat data berhasil di-load
  useEffect(() => {
    if (fullDataBeasiswa?.data_beasiswa) {
      const beasiswa = fullDataBeasiswa.data_beasiswa;

      console.log("=== LOADING DATA KE FORM ===");
      console.log("kode_dinas_provinsi:", beasiswa.kode_dinas_provinsi);
      console.log("kode_dinas_kabkota:", beasiswa.kode_dinas_kabkota);

      // Set nilai ke form
      setValue("kode_dinas_provinsi", beasiswa.kode_dinas_provinsi || "");
      setValue("kode_dinas_kabkota", beasiswa.kode_dinas_kabkota || "");

      // Verify bahwa data sudah ter-set
      setTimeout(() => {
        const currentValues = getValues();
        console.log("=== VERIFIKASI SETELAH SET ===");
        console.log(
          "kode_dinas_provinsi di form:",
          currentValues.kode_dinas_provinsi,
        );
        console.log(
          "kode_dinas_kabkota di form:",
          currentValues.kode_dinas_kabkota,
        );
      }, 100);
    }
  }, [fullDataBeasiswa, setValue, getValues]);

  useEffect(() => {
    console.log(errors);
    if (Object.keys(errors).length > 0) {
      setShowErrorDialog(true);
    }
  }, [errors]);

  const selectedStatus = watch("selectedStatus");

  // const mutation = useMutation({
  //   mutationFn: async (data: VerifikasiFormData) => {
  //     return beasiswaService.updateFlowBeasiswa(
  //       id,
  //       selectedStatus!,
  //       data.catatan || "",
  //       data,
  //       "dinas",
  //     );
  //   },
  //   onSuccess: (res) => {
  //     if (res.success) {
  //       toast.success(res.message);
  //       queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
  //       navigate("/beasiswa_verifikasi_dinas_provinsi");
  //     } else {
  //       toast.error(res.message);
  //     }
  //   },
  //   onError: (error: any) => {
  //     if (error?.response?.data?.message) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error("Terjadi kesalahan saat menyimpan data");
  //     }
  //   },
  // });

  const mutation = useMutation({
    mutationFn: async (data: VerifikasiFormData) => {
      await beasiswaService.saveCatatanVerifikasi(id, {
        catatan_verifikasi_dinas_provinsi: data.catatan ?? undefined,
        verifikator: "dinas_provinsi",
      });

      // selectedStatus 7 = Rekomendasi (Y), 3 = Tidak Rekomendasi (N)
      const tag = selectedStatus === 9 ? "Y" : "N";
      return beasiswaService.updateTagDinasProvinsi(id, tag);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        navigate("/beasiswa_verifikasi_dinas_provinsi");
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

  // const onSubmit = (data: VerifikasiFormData) => {
  //   const { selectedStatus: _, ...submitData } = data;
  //   mutation.mutate(submitData);
  // };

  const onSubmit = async (data: VerifikasiFormData) => {
    try {
      // ✅ Jika status Lulus (15) dan ada file yang dipilih, upload dulu
      if (data.selectedStatus === 15 && data._selectedFile) {
        toast.info("Mengupload file...");

        const uploadedUrl = await data._uploadFile(data._selectedFile);

        if (!uploadedUrl) {
          toast.error("Gagal mengupload file. Verifikasi dibatalkan.");
          return;
        }

        // Set URL file yang sudah diupload
        data.fileSuratKeputusan = uploadedUrl;
      }

      // ✅ Ambil data beasiswa untuk format kode dinas
      if (fullDataBeasiswa?.data_beasiswa) {
        const beasiswa = fullDataBeasiswa.data_beasiswa;

        // Format: "KODE#NAMA"
        if (beasiswa.kode_dinas_provinsi) {
          data.kode_dinas_provinsi = `${beasiswa.kode_dinas_provinsi}#${beasiswa.nama_dinas_provinsi || ""}`;
        }

        if (beasiswa.kode_dinas_kabkota) {
          data.kode_dinas_kabkota = `${beasiswa.kode_dinas_kabkota}#${beasiswa.nama_dinas_kabkota || ""}`;
        }
      }

      // Hapus helper fields
      const {
        selectedStatus: _,
        _uploadFile,
        _selectedFile,
        ...submitData
      } = data;

      // Submit data verifikasi
      mutation.mutate(submitData);
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses data");
    }
  };

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Verifikasi Provinsi",
            url: "/beasiswa_verifikasi_dinas_provinsi",
          },
          { name: "Detail", url: "#" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Seleksi Administratif</p>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <FullDataBeasiswaCatatan
            idTrxBeasiswa={id}
            register={register}
            control={control}
            errors={errors}
          />
        </div>

        {/* Verification Card - Sticky */}
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
  );
};

export default BeasiswaVerifikasiProvinsiDetailPage;
