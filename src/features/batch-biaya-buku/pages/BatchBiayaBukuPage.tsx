import CustBreadcrumb from "@/components/CustBreadCrumb";
import DataList from "../components/DataList";

const BatchBiayaBukuPage = () => {
  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Pengajuan Biaya Buku", url: "/pengajuan-biaya-buku" }]}
      />

      <p className="text-xl font-semibold mt-4">Pengajuan Biaya Buku</p>

      <div className="mt-3">
        <DataList />
      </div>
    </>
  );
};

export default BatchBiayaBukuPage;
