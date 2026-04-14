/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import type { IPerguruanTinggi } from "@/types/master";
import useHasAccess from "@/hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal"; 
import { Card, CardContent } from "@/components/ui/card";

const PerguruanTinggiPage = () => {
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
    queryKey: ["perguruan-tinggi", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return masterService.getPerguruanTinggiByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: IPerguruanTinggi[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deletePerguruanTinggi(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus perguruan tinggi.");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Gagal menghapus perguruan tinggi."
      );
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

  const columns = useMemo(() => getColumns(handleDeleteClick), [handleDeleteClick]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb
          items={[{ name: "Perguruan Tinggi", url: "/perguruan-tinggi" }]}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Perguruan Tinggi</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola data master seluruh institusi dan universitas.</p>
            </div>
          </div>

          {canCreate && (
            <Button 
              onClick={() => navigate("/master/perguruan-tinggi/create")}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Tambah Data Baru
            </Button>
          )}
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
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
          </CardContent>
        </Card>

        <DeleteConfirmModal
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedId(null);
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
};

export default PerguruanTinggiPage;