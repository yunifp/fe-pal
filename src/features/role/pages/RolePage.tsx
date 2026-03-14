import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import { roleService } from "../services/roleService";
import type { IRole } from "../types/role";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useHasAccess from "@/hooks/useHasAccess";
import { Plus } from "lucide-react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const RolePage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [deleteRole, setDeleteRole] = useState<number | null>(null);
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
    queryKey: ["roles", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return roleService.getByPagination(page, debouncedSearch);
    },
    staleTime: STALE_TIME,
  });

  const data: IRole[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => roleService.deleteById(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["roles"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menghapus role");
      }
    },
  });

  const handleDelete = () => {
    if (!deleteRole) return;
    mutation.mutate(deleteRole, {
      onSettled: () => {
        setShowConfirmModal(false);
        setDeleteRole(null);
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
        setDeleteRole(id);
        setShowConfirmModal(true);
      }),
    []
  );

  return (
    <>
      <CustBreadcrumb items={[{ name: "Role", url: "/roles" }]} />

      <p className="text-xl font-semibold mt-4">Role</p>

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
                    navigate("/roles/create");
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

export default RolePage;
