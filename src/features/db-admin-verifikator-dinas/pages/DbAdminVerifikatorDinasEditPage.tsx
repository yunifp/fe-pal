import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CustInput } from "@/components/CustInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect } from "react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
// import { CustSelect } from "@/components/ui/CustSelect";
import {
  adminVerifikatorDinasEditSchema,
  type AdminVerifikatorDinasEditFormData,
  type IAdminVerifikator,
} from "../types/db";
// import { masterService } from "@/services/masterService";
// import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { dbService } from "../services/dbService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import LoadingDialog from "@/components/LoadingDialog";
import { Download } from "lucide-react";

const DbAdminVerifikatorDinasEditPage = () => {
  useRedirectIfHasNotAccess("C");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { id } = useParams();
  const idx = parseInt(id ?? "");

  // Ambil data detail
  const { data: responseDetailUser } = useQuery({
    queryKey: ["db-user-admin-verifikator-dinas-detail", idx],
    queryFn: () => dbService.getDetailById(idx),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const detailUser: IAdminVerifikator | null = responseDetailUser?.data ?? null;

  // Setup form dengan zod
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    // watch,
    formState: { errors },
  } = useForm<AdminVerifikatorDinasEditFormData>({
    resolver: zodResolver(adminVerifikatorDinasEditSchema),
    defaultValues: {
      no_hp: "",
      email: "",
      nama: "",
    },
  });

  useEffect(() => {
    if (!detailUser) return;

    reset({
      user_id: detailUser.user_id ?? "",
      nama: detailUser?.nama_lengkap ?? "",
      no_hp: detailUser?.no_hp ?? "",
      email: detailUser?.email ?? "",
      is_active: detailUser?.is_active ?? 0,
      surat_penunjukan: undefined,
    });
  }, [detailUser, reset]);

  const mutation = useMutation({
    mutationFn: (data: AdminVerifikatorDinasEditFormData) =>
      dbService.updateLp(idx, data),
    onSuccess: (res) => {
      // console.log(data);
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["db-user-admin-verifikator-dinas"],
        });
        queryClient.invalidateQueries({
          queryKey: ["db-user-admin-verifikator-dinas-detail", idx],
        });
        navigate("/database/user-admin-verifikator-dinas");
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

  const onSubmit = (data: AdminVerifikatorDinasEditFormData) => {
    mutation.mutate(data);
  };

  // if (isLoadingDetail || isLoadingLembagaPendidikan)
  //   return <LoadingDialog open />;

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Database Instansi Dinas Provinsi & Kabupaten / Kota",
            url: "/db-admin-verifikator-dinas",
          },
          { name: "Ubah Pengguna Instansi Dinas Provinsi & Kabupaten / Kota" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Ubah Pengguna Instansi Dinas Provinsi & Kabupaten / Kota
      </p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustInput
                id="user_id"
                label="User ID"
                error={!!errors.user_id}
                errorMessage={errors.user_id?.message}
                {...register("user_id")}
                disabled
              />

              {/* <CustSelect
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
              )} */}

              {/* <CustSearchableSelect
                name="lembaga_pendidikan"
                control={control}
                label="Lembaga Pendidikan"
                options={lembagaPendidikanOptions}
                placeholder="Pilih lembaga pendidikan"
                isRequired={true}
                error={errors.lembaga_pendidikan}
              /> */}

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
                <div className="flex gap-4 justify-between items-center">
                  <Label className="flex items-center gap-1">
                    Surat Penunjukan <span className="text-red-500">*</span>
                  </Label>

                  {detailUser?.surat_penunjukan && (
                    <a
                      onClick={() =>
                        window.open(detailUser?.surat_penunjukan!!, "_blank")
                      }
                      className="cursor-pointer hover:underline text-sm text-primary flex">
                      <Download className="h-4 w-4 mr-1" />
                      File Sebelumnya
                    </a>
                  )}
                </div>

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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Aktifkan Akun
                    </label>
                  </div>
                )}
              />
              <div className="mt-8 flex items-center justify-between">
                <Link to="/database/user-admin-verifikator-dinas">
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

export default DbAdminVerifikatorDinasEditPage;
