import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { DataTable } from "@/components/DataTable";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import UploadBeritaAcara from "../components/UploadBeritaAcara";

const BeasiswaVerifikasiDinasPage = () => {
  const [page, setPage] = useState(1);
  const [deleteTrxBeasiswa, setDeleteTrxBeasiswa] = useState<number | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);
  // Setup untuk fetch data::start
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trx-beasiswa", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      // Sekarang akan selalu dapat nilai terbaru
      return beasiswaService.getTransaksiBeasiswaByPaginationVerifikasiDinas(
        1,
        page,
        debouncedSearch
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => beasiswaService.deleteTransaksiById(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx_beasiswa"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menghapus data");
      }
    },
  });

  const handleDelete = () => {
    if (!deleteTrxBeasiswa) return;
    mutation.mutate(deleteTrxBeasiswa, {
      onSettled: () => {
        setShowConfirmModal(false);
        setDeleteTrxBeasiswa(null);
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
        setDeleteTrxBeasiswa(id);
        setShowConfirmModal(true);
      }),
    []
  );

  return (
    <>
      <CustBreadcrumb items={[{ name: "Verifikasi Dinas Prov / Kab/Kota" }]} />

      <p className="text-xl font-semibold mt-4">
        Verifikasi Dinas Prov / Kab/Kota
      </p>

      <div className="mt-3 space-y-6">
        <UploadBeritaAcara />
        <div>
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

export default BeasiswaVerifikasiDinasPage;
