/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "../../../components/CustBreadCrumb";
import { CustInput } from "../../../components/CustInput";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { STALE_TIME } from "../../../constants/reactQuery";
import { masterService } from "../../../services/masterService";
import { npsnSchema, type NpsnFormData } from "../../../types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Save, School, GraduationCap } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const NpsnEditPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const npsnId = parseInt(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError, // <-- Tambahkan setError
    formState: { errors, isSubmitting },
  } = useForm<NpsnFormData>({
    resolver: zodResolver(npsnSchema),
  });

  const { data: jenjangData, isLoading: isLoadingJenjang } = useQuery({
    queryKey: ["ref-jenjang"],
    queryFn: () => masterService.getRefJenjang(),
    staleTime: STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const jenjangList = jenjangData?.data ?? [];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["npsn", npsnId],
    queryFn: () => masterService.getNpsnById(npsnId),
    enabled: !!npsnId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const existingData = data?.data;

  useEffect(() => {
    if (!existingData) return;
    reset({
      id_jenjang: existingData.id_jenjang,
      sekolah: existingData.sekolah,
      npsn: existingData.npsn ?? "",
      jenis_sekolah: existingData.jenis_sekolah ?? "",
    });
  }, [existingData, reset]);

  useEffect(() => {
    if (isError) {
      toast.error((error as any)?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const mutation = useMutation({
    mutationFn: (formData: NpsnFormData) => masterService.updateNpsnById(npsnId, formData),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil memperbarui data NPSN");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      queryClient.invalidateQueries({ queryKey: ["npsn", npsnId] });
      navigate("/master-npsn");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Terjadi kesalahan saat menyimpan data";
      toast.error(errorMessage);

      // Tangkap error NPSN dan munculkan info error di field input
      if (errorMessage.toLowerCase().includes("npsn")) {
        setError("npsn", {
          type: "server",
          message: errorMessage,
        });
      }
    },
  });

  const onSubmit = (dataForm: NpsnFormData) => mutation.mutate(dataForm);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb
          items={[{ name: "NPSN", url: "/master/npsn" }, { name: "Ubah Data" }]}
        />

        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 hidden sm:block">
            <School className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ubah Data NPSN</h1>
            <p className="text-sm text-slate-500 mt-1">Perbarui informasi data sekolah yang sudah terdaftar.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-xl shadow-sm rounded-3xl border-slate-200 bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                Informasi Sekolah
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">Lakukan perubahan informasi sesuai data terbaru.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Jenjang Pendidikan</Label>
                    <Controller
                      control={control}
                      name="id_jenjang"
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          value={field.value ? String(field.value) : ""}
                          disabled={isLoadingJenjang}>
                          <SelectTrigger
                            className={`h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${errors.id_jenjang ? "border-rose-500 focus:ring-rose-500/20" : ""}`}>
                            <SelectValue placeholder={isLoadingJenjang ? "Memuat data..." : "Pilih jenjang sekolah"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                            {jenjangList.map((jenjang: any) => (
                              <SelectItem key={jenjang.id} value={String(jenjang.id)} className="font-medium">
                                {jenjang.jenjang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.id_jenjang && <p className="text-xs text-rose-500 font-medium ml-1">{errors.id_jenjang.message}</p>}
                  </div>

                  <CustInput label="Nama Lengkap Sekolah" placeholder="Masukkan nama resmi sekolah" {...register("sekolah")} error={!!errors.sekolah} errorMessage={errors.sekolah?.message} />

                  <CustInput label="Nomor NPSN" placeholder="8 Digit angka NPSN" {...register("npsn")} error={!!errors.npsn} errorMessage={errors.npsn?.message} />

                  <CustInput label="Tipe/Jenis Sekolah" placeholder="Contoh: SMA, SMK, atau MA" {...register("jenis_sekolah")} error={!!errors.jenis_sekolah} errorMessage={errors.jenis_sekolah?.message} />

                  <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                    <Link to="/master-npsn" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" className="w-full rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2 text-slate-400" /> Batal
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto rounded-xl h-11 px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-md font-bold transition-all">
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting || mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NpsnEditPage;