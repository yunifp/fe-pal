import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaHidupService } from "@/services/biayaHidupService";
import type { BatchItem } from "@/types/pks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import AjukanBpdpDialog from "./AjukanBpdpDialog";
import RevisiDialog from "./RevisiDialog";
import StaffDivisiBeasiswaDialog from "./StaffDivisiBeasiswaDialog";
import VerifikatorPjkDialog from "./VerifikatorPjkDialog";
import ListMahasiswaDialog from "./ListMahasiswaDialog";
import LogDialog from "../../../components/pks/LogDialog";
import { BatchDialog } from "./BatchDialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ITrxBiayaHidupPksWithPks } from "@/types/biayaHidup";
import FilterTahun from "@/components/pks/FilterTahun";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import { masterService } from "@/services/masterService";
import { useForm } from "react-hook-form";
import FilterJenjang from "@/components/pks/FilterJenjang";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const DataList = () => {
  const {
    isLembagaPendidikanVerifikator,
    isLembagaPendidikanOperator,
    isStaffDivisiBeasiswa,
    isVerifikatorPjk,
  } = useAuthRole();

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

  // Filter lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
    enabled: isVerifikatorPjk,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

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

  const [selectedBatch, setSelectedBatch] = useState<BatchItem[]>([]);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);

  const [openRevisiDialog, setOpenRevisiDialog] = useState(false);

  const [openLogDialog, setOpenLogDialog] = useState(false);

  const [openStaffBeasiswaDialog, setOpenStaffBeasiswaDialog] = useState(false);
  const [openVerifikatorPjk, setOpenVerifikatorPjk] = useState(false);

  const [selectedBiayaHidup, setSelectedBiayaHidup] =
    useState<ITrxBiayaHidupPksWithPks | null>(null);

  const resetSelectedBatch = () => setSelectedBatch([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: [
      "pengajuan-biaya-hidup",
      page,
      debouncedSearch,
      lpId,
      jenjang,
      tahun,
    ],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaHidupService.getBiayaHidupByPagination(
        page,
        debouncedSearch,
        lpId,
        jenjang,
        tahun,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBiayaHidupPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => biayaHidupService.deleteById(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pengajuan-biaya-hidup"],
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
        onRevisiVerifikator: (biayaHidup: ITrxBiayaHidupPksWithPks) => {
          setSelectedBiayaHidup(biayaHidup);
          setOpenRevisiDialog(true);
        },
        onStaffBeasiswa: (biayaHidup: ITrxBiayaHidupPksWithPks) => {
          setSelectedBiayaHidup(biayaHidup);
          setOpenStaffBeasiswaDialog(true);
        },
        onVerifikatorPjk: (biayaHidup: ITrxBiayaHidupPksWithPks) => {
          setSelectedBiayaHidup(biayaHidup);
          setOpenVerifikatorPjk(true);
        },
        onShowLog: (biayaHidup: ITrxBiayaHidupPksWithPks) => {
          setSelectedBiayaHidup(biayaHidup);
          setOpenLogDialog(true);
        },
        onDelete: (idPengajuan: number) => {
          setDeleteId(idPengajuan);
          setShowConfirmModal(true);
        },

        isLembagaPendidikanOperator,
        isLembagaPendidikanVerifikator,
        isVerifikatorPjk,
        isStaffDivisiBeasiswa,
      }),
    [],
  );

  return (
    <>
      {isLembagaPendidikanOperator && (
        <p className="text-xl font-semibold mt-4">
          Riwayat Pengajuan Biaya Hidup
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
          leftHeaderContent={
            (isStaffDivisiBeasiswa || isVerifikatorPjk) && (
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
            )
          }
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
        dataBiayaHidup={selectedBiayaHidup}
      />

      <StaffDivisiBeasiswaDialog
        open={openStaffBeasiswaDialog}
        setOpen={setOpenStaffBeasiswaDialog}
        dataBiayaHidup={selectedBiayaHidup}
      />

      <VerifikatorPjkDialog
        open={openVerifikatorPjk}
        setOpen={setOpenVerifikatorPjk}
        dataBiayaHidup={selectedBiayaHidup}
      />

      <ListMahasiswaDialog
        open={openMahasiswaDialog}
        setOpen={setOpenMahasiswaDialog}
        idTrxPks={selectedIdPengajuan!!}
      />

      <BatchDialog
        open={openBatchDialog}
        onOpenChange={setOpenBatchDialog}
        selectedBatch={selectedBatch}
        resetSelectedBatch={resetSelectedBatch}
      />

      <LogDialog
        open={openLogDialog}
        setOpen={setOpenLogDialog}
        section="biaya-hidup"
        dataBiaya={selectedBiayaHidup}
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
