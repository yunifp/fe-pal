import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaBukuService } from "@/services/biayaBukuService";
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
import type { BatchItem, ITrxBiayaBukuPksWithPks } from "@/types/biayaBuku";
import FilterTahun from "@/components/pks/FilterTahun";
import { useForm } from "react-hook-form";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import FilterJenjang from "@/components/pks/FilterJenjang";
import { masterService } from "@/services/masterService";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "sonner";

const DataList = () => {
  const {
    isLembagaPendidikanOperator: isLembagaPendidikanAdministrator,
    isLembagaPendidikanVerifikator,
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

  const [selectedBiayaBuku, setSelectedBiayaBuku] =
    useState<ITrxBiayaBukuPksWithPks | null>(null);

  const resetSelectedBatch = () => setSelectedBatch([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["pengajuan-biaya-buku", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaBukuService.getBiayaBukuByPagination(page, debouncedSearch);
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBiayaBukuPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  // Setup untuk hapus::start
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: number) => biayaBukuService.deleteById(data),
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
        onRevisiVerifikator: (biayaBuku: ITrxBiayaBukuPksWithPks) => {
          setSelectedBiayaBuku(biayaBuku);
          setOpenRevisiDialog(true);
        },
        onStaffBeasiswa: (biayaBuku: ITrxBiayaBukuPksWithPks) => {
          setSelectedBiayaBuku(biayaBuku);
          setOpenStaffBeasiswaDialog(true);
        },
        onVerifikatorPjk: (biayaBuku: ITrxBiayaBukuPksWithPks) => {
          setSelectedBiayaBuku(biayaBuku);
          setOpenVerifikatorPjk(true);
        },
        onShowLog: (biayaBuku: ITrxBiayaBukuPksWithPks) => {
          setSelectedBiayaBuku(biayaBuku);
          setOpenLogDialog(true);
        },
        onDelete: (idPengajuan: number) => {
          setDeleteId(idPengajuan);
          setShowConfirmModal(true);
        },

        // 👇 tambahan untuk checkbox batch
        selectedBatch,
        setSelectedBatch,
        isLembagaPendidikanAdministrator,
        isLembagaPendidikanVerifikator,
        isVerifikatorPjk,
        isStaffDivisiBeasiswa,
      }),
    [
      selectedBatch, // WAJIB
      setSelectedBatch, // aman & best practice
    ],
  );

  return (
    <>
      {isLembagaPendidikanAdministrator && (
        <p className="text-xl font-semibold mt-4">
          Riwayat Pengajuan Biaya Buku
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
            isVerifikatorPjk && (
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
        dataBiayaBuku={selectedBiayaBuku}
      />

      <StaffDivisiBeasiswaDialog
        open={openStaffBeasiswaDialog}
        setOpen={setOpenStaffBeasiswaDialog}
        dataBiayaBuku={selectedBiayaBuku}
      />

      <VerifikatorPjkDialog
        open={openVerifikatorPjk}
        setOpen={setOpenVerifikatorPjk}
        dataBiayaBuku={selectedBiayaBuku}
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
        section="biaya-buku"
        dataBiaya={selectedBiayaBuku}
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
