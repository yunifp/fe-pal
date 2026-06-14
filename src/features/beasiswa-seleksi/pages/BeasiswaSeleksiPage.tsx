/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BeasiswaSeleksiPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [filterIdFlow, setFilterIdFlow] = useState<string>("all");
  const [filterIdJalur, setFilterIdJalur] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 500);

  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  const { data: responseFlow } = useQuery({
    queryKey: ["flow-beasiswa"],
    queryFn: () => beasiswaService.getFlowBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trx-beasiswa", beasiswaAktif?.id, page, debouncedSearch, filterIdFlow, filterIdJalur],
    retry: false,
    enabled: !!beasiswaAktif?.id,
    refetchOnWindowFocus: false,
    queryFn: () =>
      beasiswaService.getTransaksiBeasiswaByPaginationSeleksiAdministrasi(
        beasiswaAktif?.id ?? 0,
        page,
        debouncedSearch,
        filterIdFlow !== "all" ? filterIdFlow : undefined,
        filterIdJalur !== "all" ? filterIdJalur : undefined
      ),
    staleTime: STALE_TIME,
  });

  const allData: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  const activeFilterCount = [
    filterIdFlow !== "all",
    filterIdJalur !== "all",
  ].filter(Boolean).length;

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  useEffect(() => {
    setPage(1);
  }, [filterIdFlow, filterIdJalur, debouncedSearch]);

  // Setiap kali halaman berubah, fungsi ini akan menghitung ulang nomor urut
  const columns = useMemo(() => getColumns(page, 10), [page]);

  return (
    <div className="space-y-1">
      <CustBreadcrumb items={[{ name: "Seleksi Administratif" }]} />

      <div className="flex items-center gap-3 mt-4 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight">
            Seleksi Administratif
          </h1>
          {beasiswaAktif && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Program:{" "}
              <span className="font-medium text-foreground">
                {beasiswaAktif.nama_beasiswa ?? beasiswaAktif.id}
              </span>
            </p>
          )}
        </div>
      </div>

      {!beasiswaAktif && !isLoading && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tidak ada program beasiswa aktif yang ditemukan.
          </AlertDescription>
        </Alert>
      )}

      {beasiswaAktif && (
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={allData}
          pageCount={totalPages}
          pageIndex={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          searchValue={search}
          onSearchChange={(value) => setSearch(value)}
          leftHeaderContent={
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterIdFlow} onValueChange={setFilterIdFlow}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>

                  {/* Sesuai dengan ID di Database */}
                  <SelectItem value="2">Seleksi Administrasi</SelectItem>
                  <SelectItem value="3">Tidak Lulus Administrasi</SelectItem>
                  <SelectItem value="4">Perlu Perbaikan</SelectItem>
                  <SelectItem value="5">Seleksi Hasil Perbaikan</SelectItem>

                  {/* Gunakan ID 13 jika yang dimaksud Lulus Administrasi adalah ini */}
                  <SelectItem value="13">Lulus Administrasi - Pembagian Wilayah</SelectItem>                 
                </SelectContent>
              </Select>

              <Select value={filterIdJalur} onValueChange={setFilterIdJalur}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Semua Jalur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
                  {(responseJalur?.data ?? []).map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.jalur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFilterCount > 0 && (
                <button
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setFilterIdFlow("all");
                    setFilterIdJalur("all");
                  }}>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {activeFilterCount}
                  </Badge>
                  Reset filter
                </button>
              )}
            </div>
          }
        />
      )}
    </div>
  );
};

export default BeasiswaSeleksiPage;