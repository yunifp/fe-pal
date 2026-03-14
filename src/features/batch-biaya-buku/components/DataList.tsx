import { DataTable } from "@/components/DataTable";
import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { biayaBukuService } from "@/services/biayaBukuService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import type { IBatchBiayaBukuPks } from "@/types/biayaBuku";
import DataListBiayaBuku from "./DataListBiayaBuku";
import TtdDialog from "./TtdDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DataList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [openListPks, setOpenListPks] = useState(false);
  const [openVerifikasi, setOpenVerifikasi] = useState(false);
  const [selectedIdBatch, setSelectedIdBatch] = useState<number | null>(null);

  // Setup untuk fetch data::start
  const { data: response, isLoading } = useQuery({
    queryKey: ["batch-biaya-buku", page, debouncedSearch],
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

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => biayaBukuService.autoBatchBiayaBuku(),

    onSuccess: () => {
      // Refresh data batch list
      queryClient.invalidateQueries({
        queryKey: ["batch-biaya-buku"],
        exact: false,
      });

      toast.success("Auto batching berhasil");
    },

    onError: () => {
      toast.error("Terjadi kesalahan saat auto batching");
    },
  });

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
          rightHeaderContent={
            <Button onClick={() => mutate()} disabled={isPending}>
              {isPending ? "Memproses..." : "Auto Batch Biaya Buku"}
            </Button>
          }
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
