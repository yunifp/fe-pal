import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { pksService } from "@/services/pksService";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Check,
  GraduationCap,
  Hash,
  School,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { getColumnsMahasiswa } from "../components/columns_mahasiswa";
import type { IMahasiswaPks } from "@/types/pks";
import MahasiswaDetailDialog from "../components/MahasiswaDetailModal";
import LoadingDialog from "@/components/LoadingDialog";
import ModalExcel from "../components/ModalExcel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MahasiswaListPksPage = () => {
  useRedirectIfHasNotAccess("R");

  const { idTrxPks } = useParams();
  const idTrxPksx = parseInt(idTrxPks ?? "");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [open, setOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<IMahasiswaPks | null>(null);

  const [openExcelModal, setOpenExcelModal] = useState(false);

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
    queryKey: ["pks", "mahasiswa", page, debouncedSearch, idTrxPksx],
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

  const handleExport = async () => {
    try {
      const blob = await pksService.exportMahasiswaByPks(dataPks?.id!!);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mahasiswa_${idTrxPks}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Export berhasil");
    } catch (error) {
      toast.error("Gagal export data");
    }
  };

  if (isPksLoading) {
    return <LoadingDialog open={true} />;
  }

  return (
    <>
      <div className="space-y-3">
        <Card className="shadow-none">
          <CardContent className="space-y-4">
            <h1 className="text-lg font-semibold">Informasi Mahasiswa</h1>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* No PKS */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">No PKS</div>
                  <div className="font-medium">{dataPks?.no_pks || "-"}</div>
                </div>
              </div>

              {/* Lembaga Pendidikan */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <School className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Lembaga Pendidikan
                  </div>
                  <div className="font-medium">
                    {dataPks?.lembaga_pendidikan || "-"}
                  </div>
                </div>
              </div>

              {/* Jenjang */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">Jenjang</div>
                  <div className="font-medium">{dataPks?.jenjang || "-"}</div>
                </div>
              </div>

              {/* Tahun */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">Tahun</div>
                  <div className="font-medium">
                    {dataPks?.tahun_angkatan || "-"}
                  </div>
                </div>
              </div>

              {/* Total Mahasiswa Aktif */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Mahasiswa Aktif
                  </div>
                  <div className="font-medium">
                    {dataPks?.total_mahasiswa_aktif ?? 0}
                  </div>
                </div>
              </div>

              {/* Total Mahasiswa Tidak Aktif */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <UserX className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Mahasiswa Tidak Aktif
                  </div>
                  <div className="font-medium">
                    {dataPks?.total_mahasiswa_tidak_aktif ?? 0}
                  </div>
                </div>
              </div>

              {/* Total Mahasiswa */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Total Mahasiswa
                  </div>
                  <div className="font-medium">
                    {dataPks?.total_mahasiswa ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
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
              <div className="flex items-center gap-2 text-sm">
                <p>Keterangan:</p>
                <div className="flex items-center gap-1">
                  <div className="rounded-full bg-green-100 p-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="rounded-full bg-red-100 p-1">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <span>Tidak Aktif</span>
                </div>
              </div>
            }
            rightHeaderContent={
              <Button onClick={handleExport}>Export Mahasiswa</Button>
            }
          />
        </div>
      </div>

      <MahasiswaDetailDialog
        open={open}
        onOpenChange={setOpen}
        dataMahasiswa={selectedMahasiswa}
        dataPks={dataPks}
      />

      <ModalExcel
        idTrxPks={idTrxPksx}
        open={openExcelModal}
        setOpen={setOpenExcelModal}
      />
    </>
  );
};

export default MahasiswaListPksPage;
