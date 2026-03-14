import CustBreadcrumb from "@/components/CustBreadCrumb";
import FormAjukan from "../components/FormAjukan";
import DataList from "../components/DataList";
import { Separator } from "@/components/ui/separator";
import { useAuthRole } from "@/hooks/useAuthRole";

const PengajuanBiayaTransportasiPage = () => {
  const { isLembagaPendidikanOperator: isLembagaPendidikanAdministrator } =
    useAuthRole();

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
        {isLembagaPendidikanAdministrator && (
          <>
            <FormAjukan />

            <Separator className="my-6" />
          </>
        )}

        <DataList />
      </div>
    </>
  );
};

export default PengajuanBiayaTransportasiPage;
