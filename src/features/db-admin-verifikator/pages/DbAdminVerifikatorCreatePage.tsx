import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CustInput } from "@/components/CustInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import { useMemo } from "react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { CustSelect } from "@/components/ui/CustSelect";
import {
  adminVerifikatorLpCreateSchema,
  type AdminVerifikatorLpCreateFormData,
} from "../types/db";
import { masterService } from "@/services/masterService";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { dbService } from "../services/dbService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DbAdminVerifikatorCreatePage = () => {
  useRedirectIfHasNotAccess("C");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Setup form dengan zod
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminVerifikatorLpCreateFormData>({
    resolver: zodResolver(adminVerifikatorLpCreateSchema),
    defaultValues: {
      jenis_akun: "",
      lembaga_pendidikan: "",
      nama: "",
      no_hp: "",
      email: "",
    },
  });

  // Mengambil lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt + "#" + data.nama_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

  const jenisAkunOptions = [
    {
      value: "8",
      label: "Operator",
    },
    {
      value: "9",
      label: "Verifikator",
    },
  ];

  const jabatanOperatorOptions = [
    { value: "Ketua Prodi", label: "Ketua Prodi" },
    { value: "Dekan", label: "Dekan" },
  ];

  const jabatanVerifikatorOptions = [
    { value: "Direktur", label: "Direktur" },
    { value: "Rektor", label: "Rektor" },
  ];

  const jenisAkun = watch("jenis_akun");

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: AdminVerifikatorLpCreateFormData) =>
      dbService.createLp(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["db-user-admin-verifikator-lp"],
        });
        navigate("/database/user-admin-verifikator");
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan user");
      }
    },
  });

  const onSubmit = (data: AdminVerifikatorLpCreateFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Database Operator & Verifikator Lembaga Pendidikan",
            url: "/db-admin-verifikator",
          },
          { name: "Tambah Pengguna Lembaga Pendidikan" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Tambah Pengguna Lembaga Pendidikan
      </p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustSelect
                name="jenis_akun"
                control={control}
                label="Jenis Akun"
                options={jenisAkunOptions}
                placeholder="Pilih jenis akun"
                isRequired={true}
                error={errors.jenis_akun}
              />

              {jenisAkun && (
                <CustSelect
                  name="jabatan"
                  control={control}
                  label="Jabatan"
                  options={
                    jenisAkun === "8"
                      ? jabatanOperatorOptions
                      : jabatanVerifikatorOptions
                  }
                  placeholder="Pilih jabatan"
                  isRequired
                  error={errors.jabatan}
                />
              )}

              <CustSearchableSelect
                name="lembaga_pendidikan"
                control={control}
                label="Lembaga Pendidikan"
                options={lembagaPendidikanOptions}
                placeholder="Pilih lembaga pendidikan"
                isRequired={true}
                error={errors.lembaga_pendidikan}
              />

              <CustInput
                id="nama"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                isRequired={true}
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
                {...register("nama")}
              />

              <CustInput
                id="no_hp"
                label="No. HP"
                placeholder="Contoh: 081234567890"
                isRequired={true}
                error={!!errors.no_hp}
                errorMessage={errors.no_hp?.message}
                {...register("no_hp")}
              />

              <CustInput
                id="email"
                type="email"
                label="Email"
                placeholder="Contoh: admin@lembaga.ac.id"
                isRequired={true}
                error={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
              />

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Surat Penunjukan <span className="text-red-500">*</span>
                </Label>

                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("surat_penunjukan", file, {
                        shouldValidate: true,
                      });
                    }
                  }}
                />

                <p className="text-xs text-muted-foreground">
                  Format file: PDF, JPG, PNG (maks. 2MB)
                </p>

                {errors.surat_penunjukan && (
                  <p className="text-xs text-destructive">
                    {errors.surat_penunjukan.message as string}
                  </p>
                )}
              </div>

              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aktifkan Akun
                    </label>
                  </div>
                )}
              />
              <div className="mt-8 flex items-center justify-between">
                <Link to="/database/user-admin-verifikator">
                  <Button type="button" variant={"secondary"}>
                    Kembali
                  </Button>
                </Link>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DbAdminVerifikatorCreatePage;
