import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { userEditSchema, type UserEditFormData } from "../types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { userService } from "../services/userService";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { Checkbox } from "@/components/ui/checkbox";
import { roleService } from "@/features/role/services/roleService";
import MultiSelect from "@/components/MultiSelect";
import DropAndCropCircle from "@/components/DropAndCropCircle";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const UserEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = parseInt(id ?? "");

  // Validasi form
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      nama: "",
      username: "",
      is_active: 0,
      id_role: [],
    },
  });

  // Ambil detail user
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Ambil daftar role
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Konversi ke options
  const roleOptions = useMemo(() => {
    return (
      rolesData?.data?.map((role) => ({
        value: String(role.id),
        label: role.nama,
      })) || []
    );
  }, [rolesData]);

  // Mengatur nilai default form ketika data berhasil diambil
  useEffect(() => {
    if (userData?.data) {
      reset({
        nama: userData.data?.nama_lengkap ?? "",
        username: userData.data?.user_id ?? "",
        is_active: userData.data?.is_active ?? 0,
        id_role: userData.data?.role.map((role) => role.id) ?? [],
      });
    }
  }, [userData?.data, reset]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: UserEditFormData) =>
      userService.updateById(userId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
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

  const onSubmit = (data: UserEditFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (userError) {
      toast.error(userError.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isUserError, userError]);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "User", url: "/users" }, { name: "Ubah User" }]}
      />
      <p className="text-xl font-semibold mt-4">Ubah User</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-center">
                {userData?.data?.avatar && (
                  <img
                    src={userData.data.avatar}
                    alt="Avatar"
                    className="w-[150px] h-[150px] rounded-full object-cover"
                  />
                )}
              </div>

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
                label="Nama Lengkap"
                id="nama"
                placeholder="Masukkan nama lengkap"
                {...register("nama")}
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
              />

              <CustInput
                label="Username"
                id="username"
                placeholder="Masukkan username"
                {...register("username")}
                error={!!errors.username}
                errorMessage={errors.username?.message}
              />

              <Controller
                control={control}
                name="id_role"
                render={({ field }) => (
                  <MultiSelect
                    label="Role"
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
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isUserLoading ||
                    mutation.isPending ||
                    isUserError
                  }
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserEditPage;
