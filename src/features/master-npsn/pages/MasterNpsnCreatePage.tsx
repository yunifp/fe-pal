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
import { STALE_TIME } from "@/constants/reactQuery";
import { masterService } from "@/services/masterService";
import { npsnSchema, type NpsnFormData } from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Save, School } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NpsnCreatePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
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

  const mutation = useMutation({
    mutationFn: (data: NpsnFormData) => masterService.createNpsn(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil menambahkan data NPSN");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      navigate("/master-npsn");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data",
      );
    },
  });

  const onSubmit = (data: NpsnFormData) => mutation.mutate(data);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "NPSN", url: "/master/npsn" }, { name: "Tambah NPSN" }]}
      />

      <div className="flex items-center gap-3 mt-4 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <School className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold leading-tight">Tambah NPSN</p>
          <p className="text-sm text-muted-foreground">
            Tambahkan data sekolah baru ke sistem
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
              Lengkapi semua kolom yang diperlukan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
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
                    : "Simpan Data"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NpsnCreatePage;
