import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import Countdown from "./Countdown";
import type { IBeasiswa } from "@/types/beasiswa";
import type { ICmsHero } from "@/types/master";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: (): React.CSSProperties => ({
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "124px 24px 60px",
    overflow: "hidden", // Agar gambar slider tidak melebar ke luar
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
    transition: "opacity 1.5s ease-in-out", // Transisi lembut saat ganti gambar
    zIndex: 0,
  }),
  overlay: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // Ubah angka .85 di bawah ini menjadi .4 atau .5
    backgroundImage: "linear-gradient(rgba(46,125,50,0.6), rgba(255,152,0,0.7))",
    zIndex: 1,
  }),
  content: (): React.CSSProperties => ({
    position: "relative",
    zIndex: 10, // Selalu di atas slider dan overlay
    maxWidth: 700,
    width: "100%",
  }),
  title: (): React.CSSProperties => ({
    fontSize: "clamp(1.8rem, 5vw, 3rem)",
    fontWeight: 900, // <-- Ditebalkan ke angka maksimal (Black)
    color: "#ffffff",
    letterSpacing: "0.04em",
    marginBottom: 16,
    textShadow: "0 2px 16px rgba(0,0,0,0.4)", // Shadow sedikit ditebalkan agar lebih kontras
  }),
  subtitle: (): React.CSSProperties => ({
    fontSize: "1.05rem", // Ukuran sedikit dinaikkan agar lebih nyaman dibaca
    fontWeight: 600, // <-- Weight dibesarkan menjadi Semi-bold
    color: "#ffffff", // <-- Warna dibuat full putih (sebelumnya transparan 0.85)
    textShadow: "0 2px 8px rgba(0,0,0,0.4)", // Tambahan shadow tipis agar tidak kalah dengan background
    marginBottom: 20,
  }),
  subtitleNoBeasiswa: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 600, // <-- Ditebalkan juga
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
  // Skeleton pulse untuk loading state
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

// ─── Fallback defaults (jika CMS belum ada datanya) ───────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroProps {
  beasiswaAktif: IBeasiswa | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Hero = ({ beasiswaAktif }: HeroProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fetch konten hero dari CMS
  const { data: heroResponse, isLoading: isHeroLoading } = useQuery({
    queryKey: ["cms-hero-aktif"],
    queryFn: () => masterService.getCmsHeroAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Gunakan data CMS jika ada, fallback ke default
  const hero: ICmsHero = heroResponse?.data ?? HERO_DEFAULTS;

  // Filter gambar yang valid saja
  const slideImages = [
    hero.bg_image_url,
    hero.bg_image_url_2,
    hero.bg_image_url_3,
  ].filter(Boolean) as string[];

  // Jika semua field kosong, berikan 1 gambar default agar tidak error
  if (slideImages.length === 0) {
    slideImages.push("/images/bg_beasiswa.png");
  }

  // Interval untuk auto-slide setiap 5 detik
  useEffect(() => {
    if (slideImages.length <= 1) return; // Jika cuma 1 gambar, jangan slide

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  return (
    <>
      {/* Keyframe untuk skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <section id="beranda" style={S.section()}>
        {/* ── Background Slider ── */}
        {slideImages.map((imgUrl, idx) => (
          <div key={idx} style={S.slideImage(imgUrl, idx === currentIdx)} />
        ))}

        {/* ── Overlay Gradient (Warna Transparan) ── */}
        <div style={S.overlay()} />

        {/* ── Main Content (Tetap Statis) ── */}
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
              {/* Judul dari CMS */}
              <h1 style={S.title()}>{hero.judul}</h1>

              {/* Kondisi ada / tidak beasiswa aktif */}
              {beasiswaAktif ? (
                <>
                  {hero.subjudul && <p style={S.subtitle()}>{hero.subjudul}</p>}

                  <p style={S.subtitle()}>Pendaftaran ditutup dalam</p>
                  <Countdown beasiswa={beasiswaAktif} />

                  {/* Tombol CTA */}
                  <a
                    href={hero.url_cta || "/daftar-penerima-beasiswa"}
                    style={S.cta()}>
                    {hero.label_cta || "Daftar Sekarang"}
                  </a>
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