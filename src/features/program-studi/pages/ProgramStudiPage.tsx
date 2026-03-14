/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { programStudiService } from "@/services/programStudiService";
import type { IProgramStudi } from "@/types/programStudi";
import useHasAccess from "@/hooks/useHasAccess";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const ProgramStudiPage = () => {
  useRedirectIfHasNotAccess("R");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id_pt } = useParams();
  
  const isGlobalView = !id_pt;
  const idPt = parseInt(id_pt ?? "0");
  const canCreate = useHasAccess("C");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: isGlobalView ? ["program-studi-all", page, debouncedSearch] : ["program-studi", idPt, page, debouncedSearch],
    queryFn: () => {
      if (isGlobalView) {
        return programStudiService.getAllProgramStudiPagination(page, debouncedSearch);
      }
      return programStudiService.getProgramStudiByPtPagination(idPt, page, debouncedSearch);
    },
    staleTime: STALE_TIME,
  });

  const data: IProgramStudi[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) toast.error(error.message || "Gagal memuat data program studi.");
  }, [isError, error]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => programStudiService.deleteProgramStudi(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus program studi.");
      queryClient.invalidateQueries({ queryKey: ["program-studi"] });
      queryClient.invalidateQueries({ queryKey: ["program-studi-all"] });
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal menghapus program studi.");
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
  });

  const handleDeleteClick = useCallback((id: number) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (selectedId !== null) deleteMutation.mutate(selectedId);
  };

const columns = useMemo(
    () => getColumns(isGlobalView, handleDeleteClick), 
    [isGlobalView, handleDeleteClick]
  );
  const breadcrumbItems = isGlobalView
    ? [{ name: "Master Data" }, { name: "Semua Program Studi" }]
    : [
        { name: "Perguruan Tinggi", url: "/master/perguruan-tinggi" },
        { name: "Program Studi" },
      ];

  return (
    <>
      <CustBreadcrumb items={breadcrumbItems} />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xl font-semibold">
          {isGlobalView ? "Semua Program Studi" : "Program Studi"}
        </p>

        {canCreate && (
          <Button 
            onClick={() => 
              navigate(isGlobalView ? "/master/program-studi/create" : `/master/perguruan-tinggi/${idPt}/program-studi/create`)
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Program Studi
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

export default ProgramStudiPage;