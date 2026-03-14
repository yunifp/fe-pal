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
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { masterService } from "@/services/masterService";
import { pksService } from "@/services/pksService";
import type { ITrxPks } from "@/types/pks";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import FilterTahun from "@/components/pks/FilterTahun";
import FilterJenjang from "@/components/pks/FilterJenjang";

const KeuanganSwakelolaPage = () => {
  useRedirectIfHasNotAccess("R");

  const canCreate = useHasAccess("C");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Untuk Filter
  const { control, watch, reset } = useForm({
    defaultValues: {
      lpId: "",
      jenjang: "",
      tahun: "",
    },
  });

  const lpId = watch("lpId");
  const jenjang = watch("jenjang");
  const tahun = watch("tahun");

  const isFilterActive = lpId || jenjang || tahun;

  const resetFilter = () => {
    reset({
      lpId: "",
      jenjang: "",
      tahun: "",
    });
  };

  // Fetch data pengguna
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pks-swakelola", page, debouncedSearch, lpId, jenjang, tahun],
    queryFn: () =>
      pksService.getTrxByPagination(
        page,
        debouncedSearch,
        lpId,
        jenjang,
        tahun,
        "swakelola",
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

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
        value: String(data.id_pt),
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
    mutationFn: (id: number) => pksService.deleteById(id),
    onSuccess: (res) => {
      toast[res.success ? "success" : "error"](res.message);
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pks"],
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
            name: "Keuangan Swakelola",
            url: "/database/keuangan-swakelola",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Keuangan</p>

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
            <>
              <FilterTahun control={control} />
              <FilterLembagaPendidikan
                control={control}
                options={lembagaPendidikanOptions}
              />
              <FilterJenjang control={control} />
              {isFilterActive && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={resetFilter}
                  className="cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          }
          rightHeaderContent={
            <div className="flex gap-2 items-center">
              {canCreate && (
                <Button
                  onClick={() => {
                    navigate("/database/keuangan-swakelola/create");
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

export default KeuanganSwakelolaPage;
