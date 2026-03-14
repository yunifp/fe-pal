import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { logPerubahanService } from "@/services/logPerubahanService";
import { useQuery } from "@tanstack/react-query";
import { LpCard } from "../components/LpCard";
import LoadingDialog from "@/components/LoadingDialog";
import { PerubahanProfilLembagaDialog } from "@/components/pks/PerubahanProfilLembagaDialog";
import { useState } from "react";

const PerubahanDataLembagaPendidikanPage = () => {
  useRedirectIfHasNotAccess("R");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPtId, setSelectedPtId] = useState<number | null>(null);
  const [hasPerubahan, setHasPerubahan] = useState(false);

  const { data: lpResponse, isLoading: isLpLoading } = useQuery({
    queryKey: ["perubahan-data-lembaga-pendidikan"],
    queryFn: () => logPerubahanService.getListPerubahanPt(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const dataLp = lpResponse?.data || [];

  if (isLpLoading) return <LoadingDialog open={true} title="Mengambil data" />;

  const handleOpenDialog = (lp: any) => {
    setSelectedPtId(lp.id_pt);
    setHasPerubahan(lp.has_perubahan ?? true);
    setOpenDialog(true);
  };

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Perubahan Data Lembaga Pendidikan",
            url: "/database/perubahan-data-lembaga-pendidikan",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Perubahan Data Lembaga Pendidikan
      </p>

      <div className="mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {dataLp.map((lp) => (
            <LpCard
              key={lp.id_pt}
              data={lp}
              onClick={() => handleOpenDialog(lp)}
            />
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* MODAL PERUBAHAN PROFIL PT */}
      {/* ========================= */}
      {selectedPtId && (
        <PerubahanProfilLembagaDialog
          open={openDialog}
          setOpen={setOpenDialog}
          idPt={selectedPtId}
          hasPerubahan={hasPerubahan}
        />
      )}
    </>
  );
};

export default PerubahanDataLembagaPendidikanPage;
