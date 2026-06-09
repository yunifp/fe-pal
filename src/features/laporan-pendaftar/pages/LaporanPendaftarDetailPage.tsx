import CustBreadcrumb from "@/components/CustBreadCrumb";
import FullDataBeasiswa from "@/components/beasiswa/FullDataBeasiswa";
import { useParams } from "react-router-dom";

const LaporanPendaftarDetailPage = () => {
  const { idTrxBeasiswa } = useParams();
  const id = parseInt(idTrxBeasiswa ?? "0");

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb
        items={[
          { name: "Laporan Rekap Pendaftar", url: "/laporan/pendaftar" },
          { name: "Detail Pendaftar", url: "#" },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Detail Laporan Pendaftar</h1>
        <p className="text-sm text-gray-500">
          Informasi lengkap data diri, alamat, orang tua, dan pendidikan pendaftar.
        </p>
      </div>

      <div className="mt-4">
        {/* Panggil komponen dengan properti hideDocuments diset true */}
        <FullDataBeasiswa idTrxBeasiswa={id} hideDocuments={true} />
      </div>
    </div>
  );
};

export default LaporanPendaftarDetailPage;