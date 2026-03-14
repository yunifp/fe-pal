import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { Download, Plus } from "lucide-react";

import { DataTable } from "../../../components/DataTable";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";

import { userService } from "@/features/user/services/userService";
import { getColumns } from "../components/columns";
import useHasAccess from "@/hooks/useHasAccess";

import { STALE_TIME } from "@/constants/reactQuery";
import type { IUser } from "../types/user";
import { useDebounce } from "@/hooks/useDebounce";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const UserPage = () => {
  useRedirectIfHasNotAccess("R");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const canCreate = useHasAccess("C");

  // Fetch data pengguna
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", page, debouncedSearch],
    queryFn: () => userService.getByPagination(page, debouncedSearch),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: IUser[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.totalPages ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  // Hapus user
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteById(id),
    onSuccess: (res) => {
      toast[res.success ? "success" : "error"](res.message);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat menghapus user";
      toast.error(message);
    },
  });

  const handleDelete = () => {
    if (deleteUserId === null) return;
    deleteMutation.mutate(deleteUserId, {
      onSettled: () => {
        setShowConfirmModal(false);
        setDeleteUserId(null);
        setPage(1);
      },
    });
  };

  const handleExportExcel = async () => {
    try {
      const response = await userService.exportExcel();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "users.xlsx");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Gagal mengekspor data.");
    }
  };

  const columns = useMemo(
    () =>
      getColumns((id: number) => {
        setDeleteUserId(id);
        setShowConfirmModal(true);
      }),
    [],
  );

  return (
    <div>
      <CustBreadcrumb items={[{ name: "Pengguna", url: "/users" }]} />

      <p className="text-xl font-semibold mt-4">Pengguna</p>

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
            <div className="flex gap-2 items-center">
              <Button
                onClick={handleExportExcel}
                variant={"outline"}
                size={"sm"}
              >
                <Download className="h-4 w-4" />
                Ekspor Excel
              </Button>
              {canCreate && (
                <Button
                  onClick={() => {
                    navigate("/users/create");
                  }}
                  variant={"outline"}
                  size={"sm"}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Data
                </Button>
              )}
            </div>
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
    </div>
  );
};

export default UserPage;
