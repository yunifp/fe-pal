import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";
import { menuService } from "@/services/menuService";
import type { IMenu } from "@/types/menu";
import { getColumns } from "../components/columns";
import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import useHasAccess from "@/hooks/useHasAccess";
import { Plus } from "lucide-react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const MenuPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [deleteMenu, setDeleteMenu] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const canCreate = useHasAccess("C");

  // Setup untuk fetch data::start
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["menus", page, debouncedSearch],
    queryFn: () => {
      return menuService.getByPagination(page, debouncedSearch);
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: IMenu[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => menuService.deleteById(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["menus"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menghapus menu");
      }
    },
  });

  const handleDelete = () => {
    if (!deleteMenu) return;
    mutation.mutate(deleteMenu, {
      onSettled: () => {
        setShowConfirmModal(false);
        setDeleteMenu(null);
        setPage(1);
      },
    });
  };
  // Setup untuk hapus::end

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(
    () =>
      getColumns((id: number) => {
        setDeleteMenu(id);
        setShowConfirmModal(true);
      }),
    []
  );

  return (
    <>
      <CustBreadcrumb items={[{ name: "Menu", url: "/menus" }]} />

      <p className="text-xl font-semibold mt-4">Menu</p>

      <div className="mt-3">
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={data}
          pageCount={totalPages}
          pageIndex={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          searchValue={search}
          onSearchChange={(value) => setSearch(value)}
          rightHeaderContent={
            <>
              {canCreate && (
                <Button
                  onClick={() => {
                    navigate("/menus/create");
                  }}
                  variant={"outline"}
                  size={"sm"}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Data
                </Button>
              )}
            </>
          }
        />

        {showConfirmModal && (
          <DeleteConfirmModal
            open={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </>
  );
};

export default MenuPage;
