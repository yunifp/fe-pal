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
import { Plus, GraduationCap } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={breadcrumbItems} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <GraduationCap className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isGlobalView ? "Semua Program Studi" : "Program Studi"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Kelola daftar program studi dan kuota penerimaan.</p>
            </div>
          </div>

          {canCreate && (
            <Button 
              onClick={() => 
                navigate(isGlobalView ? "/master/program-studi/create" : `/master/perguruan-tinggi/${idPt}/program-studi/create`)
              }
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Tambah Program Studi
            </Button>
          )}
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Program Studi</CardTitle>
          </CardHeader>
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

export default ProgramStudiPage;