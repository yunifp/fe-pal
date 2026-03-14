import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaPendidikanService } from "@/services/biayaPendidikanService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import AjukanBpdpDialog from "./AjukanBpdpDialog";
import RevisiDialog from "./RevisiDialog";
import StaffDivisiBeasiswaDialog from "./StaffDivisiBeasiswaDialog";
import VerifikatorPjkDialog from "./VerifikatorPjkDialog";
import ListMahasiswaDialog from "./ListMahasiswaDialog";
import LogDialog from "../../../components/pks/LogDialog";

import type { ITrxBiayaPendidikanPksWithPks } from "@/types/biayaPendidikan";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";
import TtdPimpinanDialog from "./TtdPimpinanDialog";

const DataList = () => {
  const {
    isLembagaPendidikanOperator: isLembagaPendidikanAdministrator,
    isLembagaPendidikanVerifikator,
    isStaffDivisiBeasiswa,
    isVerifikatorPjk,
    isPpk,
    isBendahara,
  } = useAuthRole();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [openMahasiswaDialog, setOpenMahasiswaDialog] = useState(false);
  const [selectedIdPengajuan, setSelectedIdPengajuan] = useState<number | null>(
    null,
  );

  const [openAjukanBpdp, setOpenAjukanBpdp] = useState(false);
  const [selectedRowAjukan, setSelectedRowAjukan] = useState<number | null>(
    null,
  );

  const [openRevisiDialog, setOpenRevisiDialog] = useState(false);

  const [openLogDialog, setOpenLogDialog] = useState(false);

  const [openStaffBeasiswaDialog, setOpenStaffBeasiswaDialog] = useState(false);
  const [openVerifikatorPjk, setOpenVerifikatorPjk] = useState(false);

  const [selectedBiayaPendidikan, setSelectedBiayaPendidikan] =
    useState<ITrxBiayaPendidikanPksWithPks | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [openTtdPimpinanDialog, setOpenTtdPimpinanDialog] = useState(false);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["pengajuan-biaya-pendidikan", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaPendidikanService.getBiayaPendidikanByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBiayaPendidikanPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => biayaPendidikanService.deleteById(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-pendidikan"],
          exact: false,
        });
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
    if (!deleteId) return;
    mutation.mutate(deleteId, {
      onSettled: () => {
        setShowConfirmModal(false);
        setDeleteId(null);
        setPage(1);
      },
    });
  };
  // Setup untuk hapus::end

  const columns = useMemo(
    () =>
      getColumns({
        onShowMahasiswa: (IdPengajuan: number) => {
          setSelectedIdPengajuan(IdPengajuan);
          setOpenMahasiswaDialog(true);
        },
        onAjukanBpdp: (IdPengajuan: number) => {
          setSelectedRowAjukan(IdPengajuan);
          setOpenAjukanBpdp(true);
        },
        onRevisiVerifikator: (
          biayaPendidikan: ITrxBiayaPendidikanPksWithPks,
        ) => {
          setSelectedBiayaPendidikan(biayaPendidikan);
          setOpenRevisiDialog(true);
        },
        onStaffBeasiswa: (biayaPendidikan: ITrxBiayaPendidikanPksWithPks) => {
          setSelectedBiayaPendidikan(biayaPendidikan);
          setOpenStaffBeasiswaDialog(true);
        },
        onVerifikatorPjk: (biayaPendidikan: ITrxBiayaPendidikanPksWithPks) => {
          setSelectedBiayaPendidikan(biayaPendidikan);
          setOpenVerifikatorPjk(true);
        },
        onShowLog: (biayaPendidikan: ITrxBiayaPendidikanPksWithPks) => {
          setSelectedBiayaPendidikan(biayaPendidikan);
          setOpenLogDialog(true);
        },
        onDelete: (idPengajuan: number) => {
          setDeleteId(idPengajuan);
          setShowConfirmModal(true);
        },
        onVerifikasiPimpinan: (idBiayaPendidikan: number) => {
          setSelectedIdPengajuan(idBiayaPendidikan);
          setOpenTtdPimpinanDialog(true);
        },

        isLembagaPendidikanAdministrator,
        isLembagaPendidikanVerifikator,
        isVerifikatorPjk,
        isStaffDivisiBeasiswa,
        isPpk,
        isBendahara,
      }),
    [],
  );

  return (
    <>
      {isLembagaPendidikanAdministrator && (
        <p className="text-xl font-semibold mt-4">
          Riwayat Pengajuan Biaya Pendidikan
        </p>
      )}

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

      <AjukanBpdpDialog
        open={openAjukanBpdp}
        setOpen={setOpenAjukanBpdp}
        idPengajuan={selectedRowAjukan}
      />

      <RevisiDialog
        open={openRevisiDialog}
        setOpen={setOpenRevisiDialog}
        dataBiayaPendidikan={selectedBiayaPendidikan}
      />

      <StaffDivisiBeasiswaDialog
        open={openStaffBeasiswaDialog}
        setOpen={setOpenStaffBeasiswaDialog}
        dataBiayaPendidikan={selectedBiayaPendidikan}
      />

      <VerifikatorPjkDialog
        open={openVerifikatorPjk}
        setOpen={setOpenVerifikatorPjk}
        dataBiayaPendidikan={selectedBiayaPendidikan}
      />

      <ListMahasiswaDialog
        open={openMahasiswaDialog}
        setOpen={setOpenMahasiswaDialog}
        idTrxPks={selectedIdPengajuan!!}
      />

      <LogDialog
        open={openLogDialog}
        setOpen={setOpenLogDialog}
        section="biaya-pendidikan"
        dataBiaya={selectedBiayaPendidikan}
      />

      <TtdPimpinanDialog
        idBiayaPendidikan={selectedIdPengajuan!!}
        open={openTtdPimpinanDialog}
        setOpen={setOpenTtdPimpinanDialog}
      />

      {showConfirmModal && (
        <DeleteConfirmModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default DataList;
