import CustBreadcrumb from "@/components/CustBreadCrumb";
import DataList from "../components/DataList";

const BatchBiayaTransportasiPage = () => {
  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Pengajuan Biaya Transportasi",
            url: "/pengajuan-biaya-transportasi",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Pengajuan Biaya Transportasi</p>

      <div className="mt-3">
        <DataList />
      </div>
    </>
  );
};

export default BatchBiayaTransportasiPage;
