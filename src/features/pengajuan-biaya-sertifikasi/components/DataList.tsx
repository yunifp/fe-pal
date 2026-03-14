import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaSertifikasiService } from "@/services/biayaSertifikasiService";
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
  ITrxBiayaSertifikasiPksWithPks,
} from "@/types/biayaSertifikasi";

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

  const [selectedBiayaSertifikasi, setSelectedBiayaSertifikasi] =
    useState<ITrxBiayaSertifikasiPksWithPks | null>(null);

  const resetSelectedBatch = () => setSelectedBatch([]);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["pengajuan-biaya-sertifikasi", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaSertifikasiService.getBiayaSertifikasiByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBiayaSertifikasiPksWithPks[] = response?.data?.result ?? [];
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
          biayaSertifikasi: ITrxBiayaSertifikasiPksWithPks,
        ) => {
          setSelectedBiayaSertifikasi(biayaSertifikasi);
          setOpenRevisiDialog(true);
        },
        onStaffBeasiswa: (biayaSertifikasi: ITrxBiayaSertifikasiPksWithPks) => {
          setSelectedBiayaSertifikasi(biayaSertifikasi);
          setOpenStaffBeasiswaDialog(true);
        },
        onVerifikatorPjk: (
          biayaSertifikasi: ITrxBiayaSertifikasiPksWithPks,
        ) => {
          setSelectedBiayaSertifikasi(biayaSertifikasi);
          setOpenVerifikatorPjk(true);
        },
        onShowLog: (biayaSertifikasi: ITrxBiayaSertifikasiPksWithPks) => {
          setSelectedBiayaSertifikasi(biayaSertifikasi);
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
          Riwayat Pengajuan Biaya Sertifikasi
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
        dataBiayaSertifikasi={selectedBiayaSertifikasi}
      />

      <StaffDivisiBeasiswaDialog
        open={openStaffBeasiswaDialog}
        setOpen={setOpenStaffBeasiswaDialog}
        dataBiayaSertifikasi={selectedBiayaSertifikasi}
      />

      <VerifikatorPjkDialog
        open={openVerifikatorPjk}
        setOpen={setOpenVerifikatorPjk}
        dataBiayaSertifikasi={selectedBiayaSertifikasi}
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
        section="biaya-sertifikasi"
        dataBiaya={selectedBiayaSertifikasi}
      />
    </>
  );
};

export default DataList;
