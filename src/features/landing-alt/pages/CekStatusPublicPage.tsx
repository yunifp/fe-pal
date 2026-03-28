import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";

import Navbar from "../components/landing-page/NavbarLanding";
import Footer from "../components/landing-page/Footer";
import CekStatusWidget from "../components/landing-page/CheckStatusWidget";

const CekStatusPage = () => {
  const { data: responseBeasiswaAktif, isLoading: isBeasiswaAktifLoading } =
    useQuery({
      queryKey: ["beasiswa-aktif"],
      queryFn: () => beasiswaService.getBeasiswaAktif(),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fbe7] scroll-smooth font-sans text-[#1a1a1a]">
      <Navbar
        hasBeasiswaAktif={beasiswaAktif !== null}
        isBeasiswaLoading={isBeasiswaAktifLoading}
      />

      {/* Hero Section dengan kombinasi Tailwind & style background image agar presisi */}
      <section 
        className="relative flex flex-col items-center justify-center flex-1 w-full pt-32 pb-20 px-6 bg-fixed bg-center bg-cover"
        style={{ 
          backgroundImage: "linear-gradient(135deg, rgba(27, 94, 32, 0.95) 0%, rgba(245, 124, 0, 0.85) 100%), url('/images/bg_beasiswa.png')" 
        }}
      >
        <div className="w-full max-w-4xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CekStatusWidget />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CekStatusPage;