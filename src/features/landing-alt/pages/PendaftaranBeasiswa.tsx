import { useQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Hero from "../components/pendaftaran-beasiswa/Hero";
import InformasiBeasiswa from "../components/pendaftaran-beasiswa/InformasiBeasiswa";
import Navbar from "../components/pendaftaran-beasiswa/Navbar";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";

const PendaftaranBeasiswa = () => {
  const {
    data: responseBeasiswaAktif,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  const hasBeasiswa = beasiswaAktif !== null;

  return (
    <>
      <Navbar hasBeasiswaAktif={hasBeasiswa} isBeasiswaLoading={isLoading} />
      <Hero
        beasiswaAktif={beasiswaAktif}
        isBeasiswaLoading={isLoading}
        isBeasiswaError={isError}
      />
      <InformasiBeasiswa />
      <Footer />
    </>
  );
};

export default PendaftaranBeasiswa;
