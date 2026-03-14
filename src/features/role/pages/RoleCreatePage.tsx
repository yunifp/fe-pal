import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { roleService } from "../services/roleService";
import { toast } from "sonner";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { roleSchema, type RoleFormData } from "../types/role";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const RoleCreatePage = () => {
  useRedirectIfHasNotAccess("C");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Setup form dengan zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { nama: "" },
  });

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: RoleFormData) => roleService.create(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["roles"] });
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

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Role", url: "/roles" }, { name: "Tambah Role" }]}
      />

      <p className="text-xl font-semibold mt-4">Tambah Role</p>

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

export default RoleCreatePage;
