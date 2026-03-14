import { TabsContent } from "@/components/ui/tabs";
import type { IMahasiswaPks, ITrxTracerStudi } from "@/types/pks";
import ModernTable from "../../../../../components/pks/ModernTable";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import TracerStudiCreate from "./TracerStudiCreate";
import { SectionHeader } from "@/components/SectionHeader";
import { FilePlus, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Props {
  data?: IMahasiswaPks | null;
}

export const TracerStudiTab = ({ data }: Props) => {
  const idTrxMahasiswa = data?.id;

  const { isLembagaPendidikanOperator: isLembagaPendidikanAdministrator } =
    useAuthRole();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["data-mahasiswa", "tracer-studi", idTrxMahasiswa],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return pksService.getTracerStudiByMahasiswa(idTrxMahasiswa!!);
    },
    staleTime: STALE_TIME,
    enabled: idTrxMahasiswa !== undefined,
  });

  const dataTracerStudi: ITrxTracerStudi[] = response?.data ?? [];

  if (isLoading) {
    return (
      <TabsContent value="tracer-studi" className="mt-0">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border animate-pulse">
            <div className="text-center">
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-50 rounded"></div>
            <div className="h-16 bg-gray-50 rounded"></div>
          </div>
        </div>
      </TabsContent>
    );
  }

  if (isError) {
    return (
      <TabsContent value="tracer-studi" className="mt-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-semibold text-lg">
              Gagal Memuat Data Tracer Studi
            </p>
            <p className="text-sm text-red-500 mt-1">
              {error instanceof Error ? error.message : "Terjadi kesalahan"}
            </p>
          </div>
        </div>
      </TabsContent>
    );
  }

  const tableRows = dataTracerStudi.map((item) => [
    item.jalur_karir ?? "-",
    item.kontribusi_lulusan ?? "-",
  ]);

  return (
    <TabsContent value="tracer-studi" className="mt-0 p-1">
      <div className="space-y-4">
        {isLembagaPendidikanAdministrator && (
          <>
            <div>
              <SectionHeader
                title="Tambah Tracer Studi"
                subtitle=" Isi formulir di bawah untuk menambah tracer studi"
                Icon={FilePlus}
              />
              <TracerStudiCreate idTrxMahasiswa={idTrxMahasiswa!!} />
            </div>
            <Separator className="my-10" />
          </>
        )}

        <div>
          <SectionHeader
            title="Riwayat Tracer Studi"
            subtitle="Tracer Studi yang telah diajukan"
            Icon={History}
          />
          <ModernTable
            headers={["Jalur Karir", "Kontribusi Lulusan"]}
            rows={tableRows}
          />
        </div>
      </div>
    </TabsContent>
  );
};
