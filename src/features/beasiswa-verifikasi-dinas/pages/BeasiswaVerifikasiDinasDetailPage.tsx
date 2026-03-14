import CustBreadcrumb from "@/components/CustBreadCrumb";
import { useParams } from "react-router-dom";
import CardVerifikasiBeasiswa from "../components/CardVerifikasiBeasiswa";
import FullDataBeasiswaCatatan from "../components/FullDataBeasiswaCatatan";

const BeasiswaVerifikasiDinasDetailPage = () => {
  // useRedirectIfHasNotAccess("U");

  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "");

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Verifikasi Dinas Prov / Kab/Kota",
            url: "/beasiswa_verifikasi_dinas",
          },
          { name: "Detail", url: "#" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Verifikasi Dinas Prov / Kab/Kota
      </p>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <FullDataBeasiswaCatatan idTrxBeasiswa={id} />
        </div>

        {/* Verification Card - Sticky */}
        <div className="lg:col-span-1">
          <CardVerifikasiBeasiswa idTrxBeasiswa={id} />
        </div>
      </div>
    </>
  );
};

export default BeasiswaVerifikasiDinasDetailPage;
