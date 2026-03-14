import type { IMahasiswaPks } from "@/types/pks";
import { IdentitasUpdate } from "./IdentitasUpdate";
import { IdentitasDetail } from "./IdentitasDetail";
import { useAuthRole } from "@/hooks/useAuthRole";

interface Props {
  data?: IMahasiswaPks | null;
}

const IdentitasTab = ({ data }: Props) => {
  // sementara hardcode dulu
  const { isLembagaPendidikanOperator: isLembagaPendidikanAdministrator } =
    useAuthRole();

  return (
    <>
      {isLembagaPendidikanAdministrator ? (
        <IdentitasUpdate data={data} />
      ) : (
        <IdentitasDetail data={data} />
      )}
    </>
  );
};

export default IdentitasTab;
