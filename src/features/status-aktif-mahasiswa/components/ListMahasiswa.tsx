import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import type { GetLockDataRequest, IMahasiswaPks, ITrxPks } from "@/types/pks";
import { getColumnsMahasiswa } from "./columns_mahasiswa";
import UpdateStatusAktifMahasiswaDialog from "@/components/pks/UpdateStatusAktifMahasiswaDialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { KunciDataDialog } from "./KunciDataDialog";
import { cn } from "@/lib/utils";

interface ListMahasiswaProps {
  dataPks: ITrxPks;
}
const ListMahasiswa = ({ dataPks }: ListMahasiswaProps) => {
  const idTrxPks = dataPks.id;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [open, setOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<IMahasiswaPks | null>(null);

  const [openKunciData, setOpenKunciData] = useState(false);

  const { data: mahasiswaResponse, isLoading: isMahasiswaLoading } = useQuery({
    queryKey: ["pks", "mahasiswa", idTrxPks, page, debouncedSearch],
    queryFn: () =>
      pksService.getMahasiswaByIdPksAndPagination(
        page,
        debouncedSearch,
        idTrxPks,
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const dataMahasiswa = mahasiswaResponse?.data?.result || [];
  const totalPagesDataMahasiswa: number =
    mahasiswaResponse?.data?.total_pages ?? 0;

  const now = new Date();

  const bulan = now.toLocaleString("id-ID", { month: "long" });
  const tahun = now.getFullYear().toString();

  const { data: getLockDataResponse, isLoading: isGetLockDataLoading } =
    useQuery({
      queryKey: ["pks", "mahasiswa", "lock-data", idTrxPks, bulan, tahun],
      queryFn: () => {
        const data: GetLockDataRequest = {
          id_trx_pks: idTrxPks,
          bulan,
          tahun,
        };

        return pksService.getLockedDataPks(data);
      },
      enabled: !!idTrxPks && !!bulan && !!tahun,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const isDataUpdated = getLockDataResponse?.data === "Y";

  const columns = useMemo(
    () =>
      getColumnsMahasiswa((mahasiswa) => {
        setSelectedMahasiswa(mahasiswa);
        setOpen(true);
      }, isDataUpdated),
    [isDataUpdated],
  );

  return (
    <>
      <DataTable
        isLoading={isMahasiswaLoading}
        columns={columns}
        data={dataMahasiswa}
        pageCount={totalPagesDataMahasiswa}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        searchValue={search}
        onSearchChange={(value) => setSearch(value)}
        rightHeaderContent={
          <Button
            onClick={() => setOpenKunciData(true)}
            disabled={isGetLockDataLoading || isDataUpdated}
            className={cn(
              isDataUpdated && "bg-gray-300 text-gray-600 cursor-not-allowed",
            )}
          >
            {isGetLockDataLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengecek status...
              </>
            ) : isDataUpdated ? (
              "Data sudah di-update"
            ) : (
              <>
                <Send className="h-4 w-4" />
                Update Selesai
              </>
            )}
          </Button>
        }
      />

      <UpdateStatusAktifMahasiswaDialog
        open={open}
        onOpenChange={setOpen}
        dataMahasiswa={selectedMahasiswa}
      />

      <KunciDataDialog
        dataPks={dataPks}
        open={openKunciData}
        onOpenChange={setOpenKunciData}
      />
    </>
  );
};

export default ListMahasiswa;
