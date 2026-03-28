/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { npsnSchema, type NpsnFormData } from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const NpsnEditPage = () => {
  useRedirectIfHasNotAccess("U");

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

  // Ambil data jenjang dari ref_jenjang
  const { data: jenjangData, isLoading: isLoadingJenjang } = useQuery({
    queryKey: ["ref-jenjang"],
    queryFn: () => masterService.getRefJenjang(),
    staleTime: STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const jenjangList = jenjangData?.data ?? [];

  // Ambil detail NPSN
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

  const mutation = useMutation({
    mutationFn: (formData: NpsnFormData) =>
      masterService.updateNpsnById(npsnId, formData),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil memperbarui data NPSN");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      queryClient.invalidateQueries({ queryKey: ["npsn", npsnId] });
      navigate("/master/npsn");
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (dataForm: NpsnFormData) => {
    mutation.mutate(dataForm);
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as any)?.message || "Terjadi kesalahan saat memuat data.",
      );
    }
  }, [isError, error]);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "NPSN", url: "/master/npsn" }, { name: "Ubah NPSN" }]}
      />
      <p className="text-xl font-semibold mt-4">Ubah NPSN</p>

      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-center text-gray-500 py-4">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Dropdown Jenjang */}
                <div className="space-y-1">
                  <Label>Jenjang</Label>
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
                                : "Pilih jenjang"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {jenjangList.map((jenjang: any) => (
                            <SelectItem
                              key={jenjang.id_jenjang}
                              value={String(jenjang.id_jenjang)}>
                              {jenjang.nama_jenjang}
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
                  placeholder="Masukkan nomor NPSN"
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

                <div className="mt-8 flex items-center justify-between">
                  <Link to="/master/npsn">
                    <Button type="button" variant="secondary">
                      Kembali
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}>
                    {isSubmitting || mutation.isPending
                      ? "Menyimpan..."
                      : "Simpan"}
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
