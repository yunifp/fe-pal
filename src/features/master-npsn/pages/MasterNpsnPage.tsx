/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getNpsnColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import type { INpsn } from "@/types/master";
import useHasAccess from "@/hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const NpsnPage = () => {
  useRedirectIfHasNotAccess("R");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canCreate = useHasAccess("C");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["npsn", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => masterService.getNpsnByPagination(page, debouncedSearch),
    staleTime: STALE_TIME,
  });

  const data: INpsn[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as any)?.message || "Terjadi kesalahan saat memuat data.",
      );
    }
  }, [isError, error]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deleteNpsn(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus data NPSN.");
      queryClient.invalidateQueries({ queryKey: ["npsn"] });
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal menghapus data NPSN.");
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
  });

  const handleDeleteClick = useCallback((id: number) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (selectedId !== null) {
      deleteMutation.mutate(selectedId);
    }
  };

  const columns = useMemo(
    () => getNpsnColumns(handleDeleteClick),
    [handleDeleteClick],
  );

  return (
    <>
      <CustBreadcrumb items={[{ name: "NPSN", url: "/master/npsn" }]} />

      <div className="flex justify-between items-center mt-4">
        <p className="text-xl font-semibold">Data NPSN</p>
        {canCreate && (
          <Button onClick={() => navigate("/master-npsn/create")}>
            <Plus className="mr-2 h-4 w-4" /> Tambah NPSN
          </Button>
        )}
      </div>

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
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedId(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default NpsnPage;
