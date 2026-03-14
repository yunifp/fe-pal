import { TabsContent } from "@/components/ui/tabs";
import type { IMahasiswaWithPks } from "@/types/pks";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { SectionHeader } from "@/components/SectionHeader";
import { FilePlus, History } from "lucide-react";
import { IpkCreate } from "./IpkCreate";
import { IpkReadOnly } from "./IpkReadOnly";

// tabs/IpkTab.tsx
interface Props {
  data?: IMahasiswaWithPks | null;
}

export const IpkTab = ({ data }: Props) => {
  const idTrxMahasiswa = data?.id;

  const { isLembagaPendidikanOperator: isLembagaPendidikanAdministrator } =
    useAuthRole();

  const {
    data: _,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["data-mahasiswa", "ipk", idTrxMahasiswa],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return pksService.getIpkByMahasiswa(idTrxMahasiswa!!);
    },
    staleTime: STALE_TIME,
    enabled: idTrxMahasiswa !== undefined,
  });

  // const dataIpk: ITrxIpk[] = response?.data ?? [];

  if (isLoading) {
    return (
      <TabsContent value="ipk" className="mt-0">
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
      <TabsContent value="ipk" className="mt-0">
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
            <p className="font-semibold text-lg">Gagal Memuat Data IPK</p>
            <p className="text-sm text-red-500 mt-1">
              {error instanceof Error ? error.message : "Terjadi kesalahan"}
            </p>
          </div>
        </div>
      </TabsContent>
    );
  }

  // const tableRows = dataIpk.map((item) => {
  //   const nilai = item.nilai ? Number(item.nilai) : null;

  //   return [
  //     `Semester ${item.semester ?? "-"}`,
  //     nilai !== null ? nilai.toFixed(2) : "-",
  //   ];
  // });

  // const ipkKumulatif =
  //   dataIpk.length > 0
  //     ? (
  //         dataIpk.reduce((total, item) => {
  //           const nilai = Number(item.nilai);
  //           return total + (isNaN(nilai) ? 0 : nilai);
  //         }, 0) / dataIpk.length
  //       ).toFixed(2)
  //     : "-";

  return (
    <TabsContent value="ipk" className="mt-0 p-1">
      <div className="space-y-4">
        {isLembagaPendidikanAdministrator ? (
          <>
            <div>
              <SectionHeader
                title="Kelola IPK"
                subtitle="Isi formulir di bawah untuk mengelola IPK"
                Icon={FilePlus}
              />
              <IpkCreate dataMahasiswa={data!!} jenjang={data?.jenjang!!} />
            </div>
          </>
        ) : (
          <>
            <div>
              <SectionHeader
                title="Data IPK Mahasiswa"
                subtitle="Informasi IPK per semester"
                Icon={History}
              />
              <IpkReadOnly dataMahasiswa={data!!} jenjang={data?.jenjang!!} />
            </div>
          </>
        )}

        {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">IPK Kumulatif</p>
            <p className="text-4xl font-bold">{ipkKumulatif}</p>
          </div>
        </div>

        <div>
          <SectionHeader
            title="Riwayat IPK"
            subtitle="IPK yang telah diajukan"
            Icon={History}
          />
          <ModernTable headers={["Semester", "IPK"]} rows={tableRows} />
        </div> */}
      </div>
    </TabsContent>
  );
};
