import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";

import Navbar from "../components/landing-page/NavbarLanding";
import Hero from "../components/landing-page/Hero";
import TentangBeasiswa from "../components/landing-page/Tentangbeasiswa";
import JalurPendaftaran from "../components/landing-page/Jalurpendaftaran";
import Kontak from "../components/landing-page/Kontak";
import Footer from "../components/landing-page/Footer";

// ─── Global base styles ───────────────────────────────────────────────────────

const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a;
    background: #f9fbe7;
    line-height: 1.6;
  }
`;

// ─── Page ─────────────────────────────────────────────────────────────────────

const LandingPageAlt = () => {
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
    <>
      <style>{globalStyle}</style>
      <Navbar
        hasBeasiswaAktif={beasiswaAktif !== null}
        isBeasiswaLoading={isBeasiswaAktifLoading}
      />
      <Hero beasiswaAktif={beasiswaAktif} />
      <TentangBeasiswa />
      <JalurPendaftaran />
      <Kontak />
      <Footer />
    </>
  );
};

export default LandingPageAlt;
