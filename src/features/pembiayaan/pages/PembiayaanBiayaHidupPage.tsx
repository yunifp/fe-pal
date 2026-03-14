import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { pksService } from "@/services/pksService";
import { useParams } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { getColumnsMahasiswa } from "../components/biaya-hidup/columns_biaya_hidup";
import type { IMahasiswaPks } from "@/types/pks";
import LoadingDialog from "@/components/LoadingDialog";
import UpdateStatusAktifMahasiswaDialog from "../../../components/pks/UpdateStatusAktifMahasiswaDialog";
import { DetailPks } from "@/components/pks/DetailPks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PengajuanBiaya from "../components/biaya-hidup/PengajuanBiaya";

const PembiayaanBiayaHidupPage = () => {
  useRedirectIfHasNotAccess("R");

  const { idTrxPks } = useParams();
  const idTrxPksx = parseInt(idTrxPks ?? "");

  const [activeTab, setActiveTab] = useState("pengajuan-biaya");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [open, setOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<IMahasiswaPks | null>(null);

  // ================= PKS DETAIL =================
  const { data: pksResponse, isLoading: isPksLoading } = useQuery({
    queryKey: ["pks", "detail", idTrxPksx],
    queryFn: () => pksService.getDetailPksById(idTrxPksx),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const dataPks = pksResponse?.data;

  // ================= MAHASISWA LIST =================
  const { data: mahasiswaResponse, isLoading: isMahasiswaLoading } = useQuery({
    queryKey: [
      "pks",
      "mahasiswa",
      "biaya-hidup",
      page,
      debouncedSearch,
      idTrxPksx,
    ],
    queryFn: () =>
      pksService.getMahasiswaByIdPksAndPagination(
        page,
        debouncedSearch,
        idTrxPksx,
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
      getColumnsMahasiswa((mahasiswa) => {
        setSelectedMahasiswa(mahasiswa);
        setOpen(true);
      }),
    [],
  );

  if (isPksLoading || isMahasiswaLoading) {
    return <LoadingDialog open={true} />;
  }

  return (
    <>
      <div className="w-full space-y-4">
        {dataPks && <DetailPks dataPks={dataPks} />}
        <Card className="shadow-none">
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger
                  value="pengajuan-biaya"
                  className="text-sm font-medium cursor-pointer"
                >
                  Pengajuan Biaya
                </TabsTrigger>
                <TabsTrigger
                  value="update-data"
                  className="text-sm font-medium cursor-pointer"
                >
                  Update Data Mahasiswa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pengajuan-biaya" className="space-y-4 mt-0">
                <PengajuanBiaya idTrxPks={idTrxPksx} />
              </TabsContent>

              <TabsContent value="update-data" className="space-y-4 mt-0">
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <UpdateStatusAktifMahasiswaDialog
        open={open}
        onOpenChange={setOpen}
        dataMahasiswa={selectedMahasiswa}
      />
    </>
  );
};

export default PembiayaanBiayaHidupPage;
