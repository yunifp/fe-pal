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
// import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { CustSelect } from "@/components/ui/CustSelect";
import {
  adminVerifikatorDinasCreateSchema,
  type AdminVerifikatorDinasCreateFormData,
} from "../types/db";
import { masterService } from "@/services/masterService";
import { roleService } from "@/features/role/services/roleService";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { dbService } from "../services/dbService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustPassword } from "@/components/CustPassword";

const DbAdminVerifikatorDinasCreatePage = () => {
  // useRedirectIfHasNotAccess("C");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminVerifikatorDinasCreateFormData>({
    resolver: zodResolver(adminVerifikatorDinasCreateSchema),
    defaultValues: {
      jenis_akun: "",
      username: "",
      password: "",
      nama: "",
      no_hp: "",
      email: "",
      is_active: 1,
    },
  });

  const jenisAkun = watch("jenis_akun");
  const selectedProvinsi = watch("provinsi");

  // --- ROLE DATA QUERIES (Dynamic dari Database) ---
  const { data: rolesData } = useQuery({
    queryKey: ["roles-all"],
    queryFn: () => roleService.getAll(),
    staleTime: STALE_TIME,
  });

  const jenisAkunOptions = useMemo(() => {
    if (!rolesData?.data) return [];
    // Filter ID Role: 3 (Provinsi), 4 (Kabkota)
    const allowedRoles = [3, 4];
    return rolesData.data
      .filter((role) => allowedRoles.includes(role.id))
      .map((role) => ({
        value: String(role.id),
        label: role.nama,
      }));
  }, [rolesData]);

  // --- MASTER DATA QUERIES ---
  const { data: responseProvinsi } = useQuery({
    queryKey: ["opsi-provinsi"],
    queryFn: () => masterService.getProvinsi(),
    staleTime: STALE_TIME,
  });
  const provinsiOptions = useMemo(() => {
    return (
      responseProvinsi?.data?.map((p) => ({
        value: String(`${p.kode_pro}#${p.nama_wilayah}`),
        label: p.nama_wilayah,
      })) || []
    );
  }, [responseProvinsi]);

  const { data: responseKabkot } = useQuery({
    queryKey: ["opsi-kabkot", selectedProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedProvinsi?.split("#")[0] || ""),
    enabled: !!selectedProvinsi,
    staleTime: STALE_TIME,
  });
  const kabkotOptions = useMemo(() => {
    return (
      responseKabkot?.data?.map((k) => ({
        value: String(`${k.kode_kab}#${k.nama_wilayah}`),
        label: k.nama_wilayah,
      })) || []
    );
  }, [responseKabkot]);

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: (data: AdminVerifikatorDinasCreateFormData) =>
      dbService.createDinas(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["db-user-admin-verifikator-dinas"],
        });
        navigate("/database/user-admin-verifikator-dinas");
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Terjadi kesalahan saat menyimpan user",
      );
    },
  });

  const onSubmit = (data: AdminVerifikatorDinasCreateFormData) =>
    mutation.mutate(data);

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Database Instansi Dinas",
            url: "/database/user-admin-verifikator-dinas",
          },
          { name: "Tambah Pengguna Instansi" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Tambah Pengguna Instansi</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustSelect
                name="jenis_akun"
                control={control}
                label="Jenis Akun"
                options={jenisAkunOptions}
                placeholder={
                  rolesData ? "Pilih jenis akun" : "Memuat data role..."
                }
                isRequired
                error={errors.jenis_akun}
              />

              <CustInput
                id="username"
                label="Username"
                placeholder="Masukkan username login"
                isRequired
                error={!!errors.username}
                errorMessage={errors.username?.message}
                {...register("username")}
              />

              <CustPassword
                id="password"
                label="Password"
                placeholder="Masukkan password login"
                required
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
              />

              <CustInput
                id="nama"
                label="Nama Lengkap Penanggung Jawab"
                placeholder="Masukkan nama lengkap"
                isRequired
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
                {...register("nama")}
              />

              <CustInput
                id="email"
                type="email"
                label="Email"
                placeholder="Contoh: admin@instansi.go.id"
                isRequired
                error={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
              />

              <CustInput
                id="no_hp"
                label="No. HP"
                placeholder="Contoh: 081234567890"
                isRequired
                error={!!errors.no_hp}
                errorMessage={errors.no_hp?.message}
                {...register("no_hp")}
              />

              {/* Conditional Fields Based on Role */}
              {(jenisAkun === "3" || jenisAkun === "4") && (
                <CustSearchableSelect
                  name="provinsi"
                  control={control}
                  label="Provinsi"
                  options={provinsiOptions}
                  placeholder="Pilih provinsi"
                  isRequired
                  error={errors.provinsi}
                />
              )}

              {jenisAkun === "4" && (
                <CustSearchableSelect
                  name="kabkota"
                  control={control}
                  label="Kabupaten/Kota"
                  options={kabkotOptions}
                  placeholder="Pilih kabupaten/kota"
                  isRequired
                  error={errors.kabkota}
                />
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Surat Penunjukan <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setValue("surat_penunjukan", file, {
                        shouldValidate: true,
                      });
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
                      className="text-sm font-medium leading-none">
                      Aktifkan Akun
                    </label>
                  </div>
                )}
              />

              <div className="mt-8 flex items-center justify-between">
                <Link to="/database/user-admin-verifikator-dinas">
                  <Button type="button" variant="secondary">
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

export default DbAdminVerifikatorDinasCreatePage;
