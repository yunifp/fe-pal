import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { pksService } from "@/services/pksService";
import type { IMahasiswaWithPks } from "@/types/pks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getColumns } from "../components/columns";
import { DataTable } from "@/components/DataTable";
import { CheckCheck, CreditCard, GraduationCap, X } from "lucide-react";
import MahasiswaDetailDialog from "../components/MahasiswaDetailModal";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { useForm } from "react-hook-form";
import { masterService } from "@/services/masterService";
import FilterTahun from "@/components/pks/FilterTahun";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import FilterJenjang from "@/components/pks/FilterJenjang";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { logPerubahanService } from "@/services/logPerubahanService";
import { toast } from "sonner";
import LoadingDialog from "@/components/LoadingDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PerubahanDataMahasiswaPage = () => {
  useRedirectIfHasNotAccess("R");

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [open, setOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<IMahasiswaWithPks | null>(null);

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

  const [searchParams] = useSearchParams();

  const jenisPerubahanFromUrl = searchParams.get("jenis_perubahan");

  // ================= MAHASISWA LIST =================
  const { data: mahasiswaResponse, isLoading: isMahasiswaLoading } = useQuery({
    queryKey: [
      "pks",
      "perubahan-data-mahasiswa",
      page,
      debouncedSearch,
      lpId,
      jenjang,
      tahun,
      jenisPerubahanFromUrl,
    ],
    queryFn: () =>
      pksService.getPerubahanDataMahasiswa(
        page,
        debouncedSearch,
        lpId,
        jenjang,
        tahun,
        jenisPerubahanFromUrl,
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const dataMahasiswa = mahasiswaResponse?.data?.result || [];

  const totalPagesDataMahasiswa: number =
    mahasiswaResponse?.data?.total_pages ?? 0;

  const columns = useMemo(
    () =>
      getColumns((mahasiswa) => {
        setSelectedMahasiswa(mahasiswa);
        setOpen(true);
      }),
    [],
  );

  const ipkMutation = useMutation({
    mutationFn: () => logPerubahanService.setujuiSemuaPerubahanIpk(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pks", "perubahan-data-mahasiswa"],
          exact: false,
        });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat mengubah data");
      }
    },
  });

  const rekeningMutation = useMutation({
    mutationFn: () => logPerubahanService.setujuiSemuaPerubahanRekening(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pks", "perubahan-data-mahasiswa"],
          exact: false,
        });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat mengubah data");
      }
    },
  });

  const statusAktifMutation = useMutation({
    mutationFn: () => logPerubahanService.setujuiSemuaPerubahanStatusAktif(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({
          queryKey: ["pks", "perubahan-data-mahasiswa"],
          exact: false,
        });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat mengubah data");
      }
    },
  });

  const actions = [
    {
      key: "ipk",
      icon: <GraduationCap className="w-4 h-4" />,
      tooltip: "Setujui Semua Perubahan IPK",
      action: () => ipkMutation.mutate(),
    },
    {
      key: "rekening",
      icon: <CreditCard className="w-4 h-4" />,
      tooltip: "Setujui Semua Perubahan Rekening",
      action: () => rekeningMutation.mutate(),
    },
    {
      key: "status_aktif",
      icon: <CheckCheck className="w-4 h-4" />,
      tooltip: "Setujui Semua Status Aktif",
      action: () => statusAktifMutation.mutate(),
    },
  ];

  const filteredActions = jenisPerubahanFromUrl
    ? actions.filter((a) => a.key === jenisPerubahanFromUrl)
    : actions;

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Perubahan Data Mahasiswa",
            url: "/database/perubahan-data-mahasiswa",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Perubahan Data Mahasiswa</p>
      <div className="mt-3">
        <DataTable
          isLoading={isMahasiswaLoading}
          columns={columns}
          data={dataMahasiswa}
          pageCount={totalPagesDataMahasiswa}
          pageIndex={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          searchValue={search}
          onSearchChange={(value) => setSearch(value)}
          leftHeaderContent={
            <>
              <FilterTahun control={control} />
              <FilterLembagaPendidikan
                control={control}
                options={lembagaPendidikanOptions}
              />
              <FilterJenjang control={control} />
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
              <div className="flex gap-1">
                <TooltipProvider>
                  {filteredActions.map((item) => (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          className="cursor-pointer"
                          onClick={item.action}
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="font-inter">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </>
          }
        />
      </div>

      <MahasiswaDetailDialog
        open={open}
        onOpenChange={setOpen}
        dataMahasiswa={selectedMahasiswa}
      />

      <LoadingDialog
        open={ipkMutation.isPending}
        title="Menyetujui semua perubahan data IPK"
      />
      <LoadingDialog
        open={rekeningMutation.isPending}
        title="Menyetujui semua perubahan data rekening"
      />
      <LoadingDialog
        open={statusAktifMutation.isPending}
        title="Menyetujui semua perubahan data status aktif"
      />
    </>
  );
};

export default PerubahanDataMahasiswaPage;
