import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaBukuService } from "@/services/biayaBukuService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import type { IBatchBiayaBukuPks } from "@/types/biayaBuku";
import DataListBiayaBuku from "./DataListBiayaTransportasi";
import TtdDialog from "./TtdDialog";

const DataList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [openListPks, setOpenListPks] = useState(false);
  const [openVerifikasi, setOpenVerifikasi] = useState(false);
  const [selectedIdBatch, setSelectedIdBatch] = useState<number | null>(null);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["batch-biaya-transportasi", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaBukuService.getPaginatedBatchBiayaBuku(page, debouncedSearch);
    },
    staleTime: STALE_TIME,
  });

  const data: IBatchBiayaBukuPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  const columns = useMemo(
    () =>
      getColumns({
        onShowList: (idBatch: number) => {
          setSelectedIdBatch(idBatch);
          setOpenListPks(true);
        },
        onShowVerifikasi: (idBatch: number) => {
          setSelectedIdBatch(idBatch);
          setOpenVerifikasi(true);
        },
      }),
    [],
  );

  return (
    <>
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

      <DataListBiayaBuku
        open={openListPks}
        setOpen={setOpenListPks}
        idBatch={selectedIdBatch!!}
      />

      <TtdDialog
        open={openVerifikasi}
        setOpen={setOpenVerifikasi}
        idBatch={selectedIdBatch!!}
      />
    </>
  );
};

export default DataList;
