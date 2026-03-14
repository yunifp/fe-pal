import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "../../../components/DataTable";
import CustBreadcrumb from "@/components/CustBreadCrumb";

import { getColumns } from "../components/columns";

import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useForm } from "react-hook-form";
import { masterService } from "@/services/masterService";
import { pksService } from "@/services/pksService";
import type { ITrxPksWithJumlahPerubahan } from "@/types/pks";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import { useAuthStore } from "@/stores/authStore";
import { useAuthRole } from "@/hooks/useAuthRole";
import FilterJenjang from "@/components/pks/FilterJenjang";
import FilterTahun from "@/components/pks/FilterTahun";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const MahasiswaPksPage = () => {
  useRedirectIfHasNotAccess("R");
  const user = useAuthStore((state) => state.user);
  const { isLembagaPendidikanOperator: isLembagaPendidikanAdministrator } =
    useAuthRole();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [searchParams] = useSearchParams();

  const q = searchParams.get("q");

  // Untuk Filter

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

  // Fetch data pengguna
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mahasiswa-pks", page, debouncedSearch, lpId, jenjang, tahun, q],
    queryFn: () =>
      pksService.getTrxWithJumlahPerubahanByPagination(
        page,
        debouncedSearch,
        lpId,
        jenjang,
        tahun,
        q,
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxPksWithJumlahPerubahan[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // Filter lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Mahasiswa Penerima Beasiswa",
            url: "/database/mahasiswa",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Mahasiswa Penerima Beasiswa
        {isLembagaPendidikanAdministrator
          ? ": " + user?.lembaga_pendidikan
          : ""}
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
              <FilterTahun control={control} />

              {!isLembagaPendidikanAdministrator && (
                <>
                  <FilterLembagaPendidikan
                    control={control}
                    options={lembagaPendidikanOptions}
                  />
                  <FilterJenjang control={control} />
                </>
              )}

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
          }
        />
      </div>
    </>
  );
};

export default MahasiswaPksPage;
