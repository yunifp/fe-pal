import Countdown from "./Countdown";
import type { IBeasiswa } from "@/types/beasiswa";
import type { FC } from "react";

interface HeroProps {
  beasiswaAktif: IBeasiswa | null;
  isBeasiswaLoading: boolean;
  isBeasiswaError: boolean;
}

const Hero: FC<HeroProps> = ({
  beasiswaAktif,
  isBeasiswaLoading,
  isBeasiswaError,
}) => {
  return (
    <section
      id="beranda"
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg-2.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full px-4 max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* ================= LOADING ================= */}
        {isBeasiswaLoading && (
          <>
            <div className="h-10 w-80 bg-white/30 rounded animate-pulse mb-4" />
            <div className="h-5 w-96 bg-white/20 rounded animate-pulse mb-6" />
          </>
        )}

        {/* ================= ERROR ================= */}
        {isBeasiswaError && (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">
              Program Beasiswa
            </h1>
            <p className="text-white/90">Gagal memuat data beasiswa</p>
          </>
        )}

        {/* ================= SUCCESS ================= */}
        {!isBeasiswaLoading && !isBeasiswaError && beasiswaAktif && (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Selamat Datang di <br />
              {beasiswaAktif.nama_beasiswa}
            </h1>

            <p className="text-md md:text-xl text-white mb-12 font-medium">
              Program Beasiswa Pengembangan Sumber Daya Manusia Perkebunan
              Kelapa Sawit Indonesia
            </p>

            <Countdown beasiswa={beasiswaAktif} />
          </>
        )}

        {/* ================= EMPTY ================= */}
        {!isBeasiswaLoading && !isBeasiswaError && !beasiswaAktif && (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">
              Tidak ada beasiswa yang aktif
            </h1>
            <p className="text-white/90">
              Silakan cek kembali dalam beberapa waktu
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;
