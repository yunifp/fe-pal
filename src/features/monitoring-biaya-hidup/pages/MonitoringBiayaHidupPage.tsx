import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import type { IMonitoringPengajuan } from "@/types/biayaHidup";
import { biayaHidupService } from "@/services/biayaHidupService";
import { useForm } from "react-hook-form";
import {
  getCurrentMonthIndonesia,
  getCurrentYear,
} from "@/utils/dateFormatter";
import FilterBulan from "@/components/pks/FilterBulan";
import FilterTahun from "@/components/pks/FilterTahun";

const MonitoringBiayaHidupPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Untuk Filter
  const currentMonth = getCurrentMonthIndonesia();
  const currentYear = getCurrentYear();

  const { control, watch } = useForm({
    defaultValues: {
      bulan: currentMonth,
      tahun: currentYear,
    },
  });

  const bulan = watch("bulan");
  const tahun = watch("tahun");

  // Setup untuk fetch data::start
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["monitoring-biaya-hidup", page, debouncedSearch, bulan, tahun],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaHidupService.monitoringPengajuan(
        page,
        debouncedSearch,
        bulan,
        tahun,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: IMonitoringPengajuan[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Monitoring Pengajuan Biaya Hidup",
            url: "/monitoring-pengajuan/biaya-hidup",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Monitoring Pengajuan Biaya Hidup: {bulan} {tahun}
      </p>

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
            <>
              <FilterBulan control={control} />
              <FilterTahun control={control} />
            </>
          }
        />
      </div>
    </>
  );
};

export default MonitoringBiayaHidupPage;
