import CustBreadcrumb from "@/components/CustBreadCrumb";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import DataList from "../components/DataList";
import FormAjukan from "../components/FormAjukan";
import { Separator } from "@/components/ui/separator";

const ValiditasIpkMahasiswaPage = () => {
  useRedirectIfHasNotAccess("R");

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Validitas IPK Mahasiswa",
            url: "/validitas-ipk-mahasiswa",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Validitas IPK Mahasiswa</p>

      <div className="mt-3">
        <FormAjukan />
        <Separator className="my-6" />
        <DataList />
      </div>
    </>
  );
};

export default ValiditasIpkMahasiswaPage;
