import CustBreadcrumb from "@/components/CustBreadCrumb";
import DataList from "../components/DataList";

const BatchBiayaPendidikanPage = () => {
  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Pengajuan Biaya Pendidikan",
            url: "/pengajuan-biaya-pendidikan",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Pengajuan Biaya Pendidikan</p>

      <div className="mt-3">
        <DataList />
      </div>
    </>
  );
};

export default BatchBiayaPendidikanPage;
