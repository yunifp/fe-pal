/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "@/features/user/services/userService";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CustInput } from "@/components/CustInput";
import { userCreateSchema, type UserCreateFormData } from "../types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import MultiSelect from "@/components/MultiSelect";
import { roleService } from "@/features/role/services/roleService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useMemo } from "react";
import DropAndCropCircle from "@/components/DropAndCropCircle";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { CustPassword } from "@/components/CustPassword";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserCreatePage = () => {
  useRedirectIfHasNotAccess("C");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      nama: "",
      username: "",
      is_active: 0,
      id_role: [],
      department_id: "",
      id_lembaga_pendidikan: "",
      lembaga_pendidikan: "",
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const roleOptions = useMemo(() => {
    return (
      rolesData?.data?.map((role) => ({
        value: String(role.id),
        label: role.nama,
      })) || []
    );
  }, [rolesData]);

  const selectedRoles = watch("id_role");

  const isLembagaPendidikan = useMemo(() => {
    if (!selectedRoles || !rolesData?.data) return false;
    const roleTarget = rolesData.data.find(
      (r: any) => r.nama === "Lembaga Pendidikan"
    );
    return roleTarget ? selectedRoles.includes(roleTarget.id) : false;
  }, [selectedRoles, rolesData]);

  const { data: ptData } = useQuery({
    queryKey: ["perguruan-tinggi"],
    queryFn: () => userService.getPerguruanTinggi(),
    enabled: isLembagaPendidikan,
    staleTime: STALE_TIME,
  });

  const mutation = useMutation({
    mutationFn: (data: UserCreateFormData) => userService.create(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        navigate("/users");
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

  const onSubmit = (data: UserCreateFormData) => {
    if (!isLembagaPendidikan) {
      data.id_lembaga_pendidikan = null;
      data.lembaga_pendidikan = null;
    }
    mutation.mutate(data);
  };

  return (
    <>
      <CustBreadcrumb
        items={[
          { name: "Pengguna", url: "/users" },
          { name: "Tambah Pengguna" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Tambah Pengguna</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="avatar"
                control={control}
                render={({ field, fieldState }) => (
                  <DropAndCropCircle
                    {...field}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <CustInput
                id="nama"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
                {...register("nama")}
              />

              <CustInput
                id="username"
                label="Username"
                placeholder="Masukkan username"
                error={!!errors.username}
                errorMessage={errors.username?.message}
                {...register("username")}
              />

              <CustPassword
                id="password"
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
              />

              <CustPassword
                id="confirm_password"
                label="Konfirmasi Kata Sandi"
                placeholder="Masukkan konfirmasi kata sandi"
                error={!!errors.confirm_password}
                errorMessage={errors.confirm_password?.message}
                {...register("confirm_password")}
              />

              <Controller
                control={control}
                name="id_role"
                render={({ field }) => (
                  <MultiSelect
                    label="Role"
                    placeholder="Pilih role"
                    error={!!errors.id_role}
                    errorMessage={errors.id_role?.message}
                    options={roleOptions}
                    value={useMemo(() => {
                      return (
                        field.value
                          ?.map((id) => {
                            const role = rolesData?.data?.find(
                              (r) => r.id === id,
                            );
                            return role
                              ? { value: String(role.id), label: role.nama }
                              : null;
                          })
                          .filter(
                            (v): v is { value: string; label: string } =>
                              v !== null,
                          ) || []
                      );
                    }, [field.value, rolesData])}
                    onChange={(selected) =>
                      field.onChange(selected.map((s) => Number(s.value)))
                    }
                  />
                )}
              />

              {isLembagaPendidikan && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Perguruan Tinggi</label>
                  <Controller
                    control={control}
                    name="id_lembaga_pendidikan"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          const selectedPt = ptData?.data?.find(
                            (pt: any) => String(pt.id_pt) === val
                          );
                          if (selectedPt) {
                            setValue("lembaga_pendidikan", selectedPt.nama_pt);
                          } else {
                            setValue("lembaga_pendidikan", "");
                          }
                        }}
                        value={field.value || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Perguruan Tinggi" />
                        </SelectTrigger>
                        <SelectContent>
                          {ptData?.data?.map((pt: any) => (
                            <SelectItem key={pt.id_pt} value={String(pt.id_pt)}>
                              {pt.nama_pt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_lembaga_pendidikan && (
                    <span className="text-red-500 text-xs">
                      {errors.id_lembaga_pendidikan.message}
                    </span>
                  )}
                </div>
              )}

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
                <Link to="/users">
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

export default UserCreatePage;