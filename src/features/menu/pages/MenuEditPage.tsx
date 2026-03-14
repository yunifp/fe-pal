import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import DynamicIcon from "@/components/DynamicIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { menuService } from "@/services/menuService";
import { useMenuStore } from "@/stores/menuStore";
import { menuSchema, type MenuFormData } from "@/types/menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const MenuEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const menuId = parseInt(id ?? "");
  const setMenus = useMenuStore((state) => state.setMenus);

  // Setup form dengan zod
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      nama: "",
      url: "",
      icon: "",
      parent_id: undefined,
      order: undefined,
    },
  });

  // Mengambil data dari API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["menu", menuId],
    queryFn: () => menuService.getById(menuId),
    enabled: !!menuId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Mengatur nilai default form ketika data berhasil diambil
  useEffect(() => {
    if (data?.data) {
      reset({
        nama: data.data?.nama ?? "",
        url: data.data?.url ?? "",
        icon: data.data?.icon ?? "",
        parent_id: data.data?.parent_id ?? undefined,
        order: data.data?.order ?? undefined,
      });
    }
  }, [data?.data, reset]);

  // Mengirim data ke API dan refresh cache
  const mutation = useMutation({
    mutationFn: (data: MenuFormData) => menuService.updateById(menuId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["menus"] });
        queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
        setMenus(res.data?.menus ?? []);
        navigate("/menus");
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan menu");
      }
    },
  });

  const onSubmit = (data: MenuFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const { data: menuParentData } = useQuery({
    queryKey: ["menus_all"],
    queryFn: () => menuService.getAll(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const menuOptions = useMemo(() => {
    return (
      menuParentData?.data?.map((menu) => ({
        value: String(menu.id),
        label: menu.nama,
      })) || []
    );
  }, [menuParentData]);

  const previewIcon = watch("icon");

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Menu", url: "/menus" }, { name: "Ubah Menu" }]}
      />

      <p className="text-xl font-semibold mt-4">Ubah Menu</p>

      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CustInput
                label="Nama Menu"
                id="nama"
                placeholder="Masukkan nama menu"
                {...register("nama")}
                error={!!errors.nama}
                errorMessage={errors.nama?.message}
              />

              <CustInput
                label="URL Menu"
                id="url"
                placeholder="Masukkan url menu"
                {...register("url")}
                error={!!errors.url}
                errorMessage={errors.url?.message}
                description={
                  <p className="text-xs text-muted-foreground">
                    Url harus dimulai dengan <code>/</code>
                  </p>
                }
              />

              <CustSearchableSelect
                name="parent_id"
                control={control}
                label="Parent"
                options={menuOptions}
                placeholder="Pilih parent menu"
                error={errors.parent_id}
              />

              <CustInput
                label="Urutan"
                id="order"
                placeholder="Masukkan urutan menu"
                type="number"
                {...register("order", { valueAsNumber: true })}
                error={!!errors.order}
                errorMessage={errors.order?.message}
              />

              <CustInput
                label="Icon Menu"
                id="icon"
                placeholder="Masukkan icon menu"
                {...register("icon")}
                error={!!errors.icon}
                errorMessage={errors.icon?.message}
                description={
                  <p className="text-xs text-muted-foreground">
                    Referensi Icon ada di:{" "}
                    <a
                      href="https://lucide.dev/icons/"
                      target="_blank"
                      className="text-blue-500"
                    >
                      https://lucide.dev/icons/
                    </a>
                  </p>
                }
              />

              <div className="grid items-center gap-2">
                <Label>Preview Icon</Label>
                <DynamicIcon name={previewIcon} />
                <small className="text-xs text-gray-500">
                  Jika Preview Icon tidak tampil berarti ada kesalahan dalam
                  nama icon
                </small>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Link to="/menus">
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
                  {isSubmitting || mutation.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MenuEditPage;
