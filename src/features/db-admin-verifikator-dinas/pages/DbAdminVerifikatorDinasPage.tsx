import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "../../../components/DataTable";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";

import { getColumns } from "../components/columns";
import useHasAccess from "@/hooks/useHasAccess";

import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import type { IAdminVerifikator } from "../types/db";
import { dbService } from "../services/dbService";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import FilterLembagaPendidikan from "../../../components/pks/FilterLembagaPendidikan";
import { masterService } from "@/services/masterService";

const DbAdminVerifikatorDinasPage = () => {
  useRedirectIfHasNotAccess("R");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Untuk Filter

  const { control, watch } = useForm({
    defaultValues: {
      lpId: "",
    },
  });

  const lpId = watch("lpId");

  const canCreate = useHasAccess("C");

  // Fetch data pengguna
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["db-user-admin-verifikator-lp", page, debouncedSearch, lpId],
    queryFn: () => dbService.getByPaginationLp(page, debouncedSearch, lpId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: IAdminVerifikator[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.totalPages ?? 0;

  // Filter lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt) ?? "",
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  // Hapus user
  const deleteMutation = useMutation({
    mutationFn: (id: number) => dbService.deleteById(id),
    onSuccess: (res) => {
      toast[res.success ? "success" : "error"](res.message);
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["db-user-admin-verifikator-lp"],
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat menghapus data";
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
      <CustBreadcrumb
        items={[
          {
            name: "Database Instansi Dinas Provinsi & Kabupaten / Kota",
            url: "/db-admin-verifikator-dinas",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Database Instansi Dinas Provinsi & Kabupaten / Kota
      </p>

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
          leftHeaderContent={
            <FilterLembagaPendidikan
              control={control}
              options={lembagaPendidikanOptions}
            />
          }
          rightHeaderContent={
            <div className="flex gap-2 items-center">
              {canCreate && (
                <Button
                  onClick={() => {
                    navigate("/database/user-admin-verifikator-dinas/create");
                  }}
                  variant={"outline"}
                  size={"sm"}>
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

export default DbAdminVerifikatorDinasPage;
