import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaTransportasiService } from "@/services/biayaTransportasiService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ITrxBiayaTransportasiPksWithPks } from "@/types/biayaTransportasi";
import { getColumnsBiayaTransportasi } from "./columns_biaya_transportasi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataListBiayaTransportasiProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  idBatch: number;
}

const DataListBiayaTransportasi = ({
  open,
  setOpen,
  idBatch,
}: DataListBiayaTransportasiProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["batch-biaya-transportasi", idBatch, page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaTransportasiService.getBiayaTransportasiByBatchAndPagination(
        idBatch,
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
    enabled: !!idBatch,
  });

  const data: ITrxBiayaTransportasiPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  const columns = useMemo(() => getColumnsBiayaTransportasi(), []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="xl"
          className="font-inter max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>List PKS</DialogTitle>
            <DialogDescription>
              Berikut merupakan list PKS yang terdapat di batch ini
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataListBiayaTransportasi;
