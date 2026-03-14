import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { roleSchema, type RoleFormData } from "../types/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { roleService } from "../services/roleService";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const RoleEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const roleId = parseInt(id ?? "");

  // Validasi form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nama: "",
    },
  });

  // Mengambil data dari API
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => roleService.getById(roleId),
    enabled: !!roleId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Mengatur nilai default form ketika data berhasil diambil
  useEffect(() => {
    if (data?.data?.nama) {
      reset({ nama: data.data.nama });
    }
  }, [data?.data, reset]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: RoleFormData) => roleService.updateById(roleId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["role", roleId] });
        navigate("/roles");
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan role");
      }
    },
  });

  const onSubmit = (data: RoleFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Role", url: "/roles" }, { name: "Ubah Role" }]}
      />
      <p className="text-xl font-semibold mt-4">Ubah Role</p>
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustInput
                label="Nama Role"
                id="nama"
                placeholder="Masukkan nama role"
                {...register("nama")}
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
              />

              <div className="mt-8 flex items-center justify-between">
                <Link to="/roles">
                  <Button type="button" variant={"secondary"}>
                    Kembali
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || isLoading || mutation.isPending || isError
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

export default RoleEditPage;
