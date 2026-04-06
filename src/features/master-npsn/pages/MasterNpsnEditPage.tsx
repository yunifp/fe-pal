/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { STALE_TIME } from "@/constants/reactQuery";
// import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { npsnSchema, type NpsnFormData } from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Save, School } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const NpsnEditPage = () => {
  // useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const npsnId = parseInt(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    control,
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
      toast.error(
        (error as any)?.message || "Terjadi kesalahan saat memuat data.",
      );
    }
  }, [isError, error]);

  const mutation = useMutation({
    mutationFn: (formData: NpsnFormData) =>
      masterService.updateNpsnById(npsnId, formData),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil memperbarui data NPSN");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      queryClient.invalidateQueries({ queryKey: ["npsn", npsnId] });
      navigate("/master-npsn");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data",
      );
    },
  });

  const onSubmit = (dataForm: NpsnFormData) => mutation.mutate(dataForm);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "NPSN", url: "/master/npsn" }, { name: "Ubah NPSN" }]}
      />

      <div className="flex items-center gap-3 mt-4 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <School className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold leading-tight">Ubah NPSN</p>
          <p className="text-sm text-muted-foreground">
            Perbarui informasi data sekolah
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-xl border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-medium">
              Informasi Sekolah
            </CardTitle>
            <CardDescription>
              Ubah data sekolah sesuai kebutuhan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {isLoading ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Dropdown Jenjang */}
                <div className="space-y-1.5">
                  <Label>
                    Jenjang <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="id_jenjang"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isLoadingJenjang}>
                        <SelectTrigger
                          className={
                            errors.id_jenjang ? "border-destructive" : ""
                          }>
                          <SelectValue
                            placeholder={
                              isLoadingJenjang
                                ? "Memuat data..."
                                : "Pilih jenjang sekolah"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {jenjangList.map((jenjang: any) => (
                            <SelectItem
                              key={jenjang.id}
                              value={String(jenjang.id)}>
                              {jenjang.jenjang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_jenjang && (
                    <p className="text-xs text-destructive">
                      {errors.id_jenjang.message}
                    </p>
                  )}
                </div>

                <CustInput
                  label="Nama Sekolah"
                  placeholder="Masukkan nama sekolah"
                  {...register("sekolah")}
                  error={!!errors.sekolah}
                  errorMessage={errors.sekolah?.message}
                />

                <CustInput
                  label="NPSN"
                  placeholder="Masukkan nomor NPSN (8 digit)"
                  {...register("npsn")}
                  error={!!errors.npsn}
                  errorMessage={errors.npsn?.message}
                />

                <CustInput
                  label="Jenis Sekolah"
                  placeholder="Contoh: SMA, SMK, MA"
                  {...register("jenis_sekolah")}
                  error={!!errors.jenis_sekolah}
                  errorMessage={errors.jenis_sekolah?.message}
                />

                <div className="pt-2 flex items-center justify-between border-t">
                  <Link to="/master/npsn">
                    <Button type="button" variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}>
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSubmitting || mutation.isPending
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NpsnEditPage;
