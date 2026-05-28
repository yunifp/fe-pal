import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import Countdown from "./Countdown";
import type { IBeasiswa } from "@/types/beasiswa";
import type { ICmsHero } from "@/types/master";

// ─── Styles (Tidak ada yang diubah) ───────────────────────────────────────────
const S = {
  section: (isMobile: boolean): React.CSSProperties => ({
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: isMobile ? "100px 16px 40px" : "124px 24px 60px",
    overflow: "hidden", 
  }),
  slideImage: (bgUrl: string, isActive: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url('${bgUrl}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity: isActive ? 1 : 0,
    transition: "opacity 1.5s ease-in-out", 
    zIndex: 0,
  }),
  overlay: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "linear-gradient(rgba(46,125,50,0.6), rgba(255,152,0,0.7))",
    zIndex: 1,
  }),
  content: (): React.CSSProperties => ({
    position: "relative",
    zIndex: 10,
    maxWidth: 700,
    width: "100%",
  }),
  title: (): React.CSSProperties => ({
    fontSize: "clamp(1.8rem, 5vw, 3rem)",
    fontWeight: 900, 
    color: "#ffffff",
    letterSpacing: "0.04em",
    marginBottom: 16,
    textShadow: "0 2px 16px rgba(0,0,0,0.4)", 
  }),
  subtitle: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 600, 
    color: "#ffffff", 
    textShadow: "0 2px 8px rgba(0,0,0,0.4)", 
    marginBottom: 20,
  }),
  subtitleNoBeasiswa: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 600, 
    color: "#ffffff",
    maxWidth: 500,
    margin: "0 auto",
    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
  }),
  cta: (): React.CSSProperties => ({
    display: "inline-block",
    marginTop: 24,
    padding: "14px 36px",
    background: "#ff9800",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: 50,
    textDecoration: "none",
    transition: "background 0.2s, transform 0.2s",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  }),
  skeletonTitle: (): React.CSSProperties => ({
    height: 48,
    width: "60%",
    background: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    margin: "0 auto 16px",
    animation: "pulse 1.5s ease-in-out infinite",
  }),
  skeletonSubtitle: (): React.CSSProperties => ({
    height: 20,
    width: "80%",
    background: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    margin: "0 auto 12px",
    animation: "pulse 1.5s ease-in-out infinite",
  }),
  skeletonCta: (): React.CSSProperties => ({
    height: 48,
    width: 180,
    background: "rgba(255,165,0,0.4)",
    borderRadius: 50,
    margin: "24px auto 0",
    animation: "pulse 1.5s ease-in-out infinite",
  }),
};

const HERO_DEFAULTS: ICmsHero = {
  id: 0,
  judul: "BEASISWA SDM SAWIT",
  subjudul:
    "Program Beasiswa Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit Indonesia",
  bg_image_url: "/images/bg_beasiswa.png",
  bg_image_url_2: null,
  bg_image_url_3: null,
  label_cta: "Daftar Sekarang",
  url_cta: "/daftar-penerima-beasiswa",
  is_active: 1,
  created_at: "",
  updated_at: "",
  created_by: null,
  updated_by: null,
};

interface HeroProps {
  beasiswaAktif: IBeasiswa | null;
  isPendaftaranTutup?: boolean;
  onTimeUp?: () => void;
}

const Hero = ({ beasiswaAktif, isPendaftaranTutup, onTimeUp }: HeroProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: heroResponse, isLoading: isHeroLoading } = useQuery({
    queryKey: ["cms-hero-aktif"],
    queryFn: () => masterService.getCmsHeroAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const hero: ICmsHero = heroResponse?.data ?? HERO_DEFAULTS;
  const slideImages = [
    hero.bg_image_url,
    hero.bg_image_url_2,
    hero.bg_image_url_3,
  ].filter(Boolean) as string[];

  if (slideImages.length === 0) {
    slideImages.push("/images/bg_beasiswa.png");
  }

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <section id="beranda" style={S.section(isMobile)}>
        {slideImages.map((imgUrl, idx) => (
          <div key={idx} style={S.slideImage(imgUrl, idx === currentIdx)} />
        ))}
        <div style={S.overlay()} />
        <div style={S.content()}>
          {isHeroLoading ? (
            <>
              <div style={S.skeletonTitle()} />
              <div style={S.skeletonSubtitle()} />
              <div style={S.skeletonSubtitle()} />
              <div style={S.skeletonCta()} />
            </>
          ) : (
            <>
              <h1 style={S.title()}>{hero.judul}</h1>
              {beasiswaAktif ? (
                <>
                  {hero.subjudul && <p style={S.subtitle()}>{hero.subjudul}</p>}
                  <p style={S.subtitle()}>Pendaftaran ditutup dalam</p>
                  
                  <Countdown beasiswa={beasiswaAktif} onTimeUp={onTimeUp} />
                  
                  {/* Tampilkan tombol Daftar hanya jika waktu belum habis */}
                  {!isPendaftaranTutup && (
                    <a
                      href={hero.url_cta || "/daftar-penerima-beasiswa"}
                      style={S.cta()}>
                      {hero.label_cta || "Daftar Sekarang"}
                    </a>
                  )}
                </>
              ) : (
                <p style={S.subtitleNoBeasiswa()}>
                  Saat ini belum ada beasiswa yang sedang dibuka. Pantau terus
                  halaman ini.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Hero;