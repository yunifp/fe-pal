import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumnsMahasiswa } from "./columns_mahasiswa";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ListMahasiswaDialogProps {
  idTrxPks: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const ListMahasiswaDialog = ({
  open,
  setOpen,
  idTrxPks,
}: ListMahasiswaDialogProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

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

  const columns = useMemo(() => getColumnsMahasiswa(), []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-x-hidden font-inter"
          size="xl"
        >
          <DialogHeader>
            <DialogTitle>Daftar Mahasiswa</DialogTitle>
          </DialogHeader>

          {/* wrapper khusus buat DataTable */}
          <div className="overflow-x-auto">
            <DataTable
              isLoading={isMahasiswaLoading}
              columns={columns}
              data={dataMahasiswa}
              pageCount={totalPagesDataMahasiswa}
              pageIndex={page - 1}
              onPageChange={(newPage) => setPage(newPage + 1)}
              searchValue={search}
              onSearchChange={(value) => setSearch(value)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListMahasiswaDialog;
