import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { beasiswaService } from "@/services/beasiswaService";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useDebounce } from "@/hooks/useDebounce";
import { getColumns } from "../components/columns";
import { toast } from "sonner";
import VerifikasiConfirmModal from "@/components/VerifikasiConfirmModal";

const BeasiswaWawancaraPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);
  const [verifikasiTrx, setVerifikasiTrx] = useState<number | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Setup untuk fetch data::start
  const { data: trxResponse, isLoading: isTrxLoading } = useQuery({
    queryKey: ["trx-beasiswa-wawancara", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return beasiswaService.getTransaksiBeasiswaByPagination(
        page,
        debouncedSearch
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = trxResponse?.data?.result ?? [];
  const totalPages: number = trxResponse?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => beasiswaService.updateFlowBeasiswa(data, 7),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["trx-beasiswa-penelaahan"],
        });
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

  const handleVerifikasi = () => {
    if (!verifikasiTrx) return;
    mutation.mutate(verifikasiTrx, {
      onSettled: () => {
        setShowConfirmModal(false);
        setVerifikasiTrx(null);
        setPage(1);
      },
    });
  };
  // Setup untuk hapus::end

  const columns = useMemo(
    () =>
      getColumns((id: number) => {
        setVerifikasiTrx(id);
        setShowConfirmModal(true);
      }),
    []
  );

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Seleksi Wawancara dan Akademik",
          },
        ]}
      />
      <p className="text-xl font-semibold mt-4">
        Seleksi Wawancara dan Akademik
      </p>

      <div className="mt-3 space-y-6">
        <DataTable
          isLoading={isTrxLoading}
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
        <VerifikasiConfirmModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleVerifikasi}
        />
      )}
    </>
  );
};

export default BeasiswaWawancaraPage;
