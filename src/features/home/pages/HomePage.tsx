import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import NotifikasiPengajuan from "../components/NotifikasiPengajuan";
import { HomeGreeting } from "../components/HomeGreeting";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Separator } from "@/components/ui/separator";
import NotifikasiPerubahanDataMahasiswa from "../components/NotifikasiPerubahanDataMahasiswa";

const HomePage = () => {
  useRedirectIfHasNotAccess("R");

  const {
    isStaffDivisiBeasiswa,
    isLembagaPendidikanVerifikator,
    isVerifikatorPjk,
    isBpdp,
  } = useAuthRole();

  return (
    <div className="space-y-6">
      <HomeGreeting />
      <Separator />
      {(isStaffDivisiBeasiswa ||
        isLembagaPendidikanVerifikator ||
        isVerifikatorPjk) && <NotifikasiPengajuan />}

      {isBpdp && <NotifikasiPerubahanDataMahasiswa />}
    </div>
  );
};

export default HomePage;
