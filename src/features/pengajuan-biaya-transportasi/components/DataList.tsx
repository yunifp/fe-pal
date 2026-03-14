import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaTransportasiService } from "@/services/biayaTransportasiService";
import { useQuery } from "@tanstack/react-query";
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
import { Layers } from "lucide-react";
import type {
  BatchItem,
  ITrxBiayaTransportasiPksWithPks,
} from "@/types/biayaTransportasi";

const DataList = () => {
  const {
    isLembagaPendidikanOperator: isLembagaPendidikanAdministrator,
    isLembagaPendidikanVerifikator,
    isStaffDivisiBeasiswa,
    isVerifikatorPjk,
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

  const [selectedBatch, setSelectedBatch] = useState<BatchItem[]>([]);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);

  const [openRevisiDialog, setOpenRevisiDialog] = useState(false);

  const [openLogDialog, setOpenLogDialog] = useState(false);

  const [openStaffBeasiswaDialog, setOpenStaffBeasiswaDialog] = useState(false);
  const [openVerifikatorPjk, setOpenVerifikatorPjk] = useState(false);

  const [selectedBiayaTransportasi, setSelectedBiayaTransportasi] =
    useState<ITrxBiayaTransportasiPksWithPks | null>(null);

  const resetSelectedBatch = () => setSelectedBatch([]);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["pengajuan-biaya-transportasi", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaTransportasiService.getBiayaTransportasiByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBiayaTransportasiPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

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
          biayaTransportasi: ITrxBiayaTransportasiPksWithPks,
        ) => {
          setSelectedBiayaTransportasi(biayaTransportasi);
          setOpenRevisiDialog(true);
        },
        onStaffBeasiswa: (
          biayaTransportasi: ITrxBiayaTransportasiPksWithPks,
        ) => {
          setSelectedBiayaTransportasi(biayaTransportasi);
          setOpenStaffBeasiswaDialog(true);
        },
        onVerifikatorPjk: (
          biayaTransportasi: ITrxBiayaTransportasiPksWithPks,
        ) => {
          setSelectedBiayaTransportasi(biayaTransportasi);
          setOpenVerifikatorPjk(true);
        },
        onShowLog: (biayaTransportasi: ITrxBiayaTransportasiPksWithPks) => {
          setSelectedBiayaTransportasi(biayaTransportasi);
          setOpenLogDialog(true);
        },

        // 👇 tambahan untuk checkbox batch

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
          Riwayat Pengajuan Biaya Transportasi
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
          rightHeaderContent={
            isVerifikatorPjk && (
              <Button
                disabled={selectedBatch.length === 0}
                onClick={() => {
                  setOpenBatchDialog(true);
                }}
              >
                <Layers />
                Proses Batch ({selectedBatch.length})
              </Button>
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
        dataBiayaTransportasi={selectedBiayaTransportasi}
      />

      <StaffDivisiBeasiswaDialog
        open={openStaffBeasiswaDialog}
        setOpen={setOpenStaffBeasiswaDialog}
        dataBiayaTransportasi={selectedBiayaTransportasi}
      />

      <VerifikatorPjkDialog
        open={openVerifikatorPjk}
        setOpen={setOpenVerifikatorPjk}
        dataBiayaTransportasi={selectedBiayaTransportasi}
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
        section="biaya-transportasi"
        dataBiaya={selectedBiayaTransportasi}
      />
    </>
  );
};

export default DataList;
