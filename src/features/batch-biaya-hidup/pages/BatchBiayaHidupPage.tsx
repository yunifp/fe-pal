import CustBreadcrumb from "@/components/CustBreadCrumb";
import DataList from "../components/DataList";

const BatchBiayaHidupPage = () => {
  return (
    <>
      <CustBreadcrumb
        items={[
          { name: "Pengajuan Biaya Hidup", url: "/pengajuan-biaya-hidup" },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Pengajuan Biaya Hidup</p>

      <div className="mt-3">
        <DataList />
      </div>
    </>
  );
};

export default BatchBiayaHidupPage;
