import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaBukuService } from "@/services/biayaBukuService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ITrxBiayaBukuPksWithPks } from "@/types/biayaBuku";
import { getColumnsBiayaBuku } from "./columns_biaya_buku";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataListBiayaBukuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  idBatch: number;
}

const DataListBiayaBuku = ({
  open,
  setOpen,
  idBatch,
}: DataListBiayaBukuProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["batch-biaya-buku", idBatch, page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaBukuService.getBiayaBukuByBatchAndPagination(
        idBatch,
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
    enabled: !!idBatch,
  });

  const data: ITrxBiayaBukuPksWithPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  const columns = useMemo(() => getColumnsBiayaBuku(), []);

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

export default DataListBiayaBuku;
