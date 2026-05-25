import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import Countdown from "./Countdown";
import type { IBeasiswa } from "@/types/beasiswa";
import type { ICmsHero } from "@/types/master";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: (bgUrl: string): React.CSSProperties => ({
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('${bgUrl}')`, // <-- Ubah menjadi backgroundImage
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "124px 24px 60px",
  }),
  content: (): React.CSSProperties => ({
    maxWidth: 700,
  }),
  title: (): React.CSSProperties => ({
    fontSize: "clamp(1.8rem, 5vw, 3rem)",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "0.04em",
    marginBottom: 16,
    textShadow: "0 2px 12px rgba(0,0,0,0.25)",
  }),
  subtitle: (): React.CSSProperties => ({
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 20,
  }),
  subtitleNoBeasiswa: (): React.CSSProperties => ({
    fontSize: "1rem",
    color: "rgba(255,255,255,0.85)",
    maxWidth: 500,
    margin: "0 auto",
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
  const bgUrl = hero.bg_image_url || "/images/bg_beasiswa.png";

  return (
    <>
      {/* Keyframe untuk skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <section id="beranda" style={S.section(bgUrl)}>
        <div style={S.content()}>
          {/* ── Loading skeleton ── */}
          {isHeroLoading ? (
            <>
              <div style={S.skeletonTitle()} />
              <div style={S.skeletonSubtitle()} />
              <div style={S.skeletonSubtitle()} />
              <div style={S.skeletonCta()} />
            </>
          ) : (
            <>
              {/* ── Judul dari CMS ── */}
              <h1 style={S.title()}>{hero.judul}</h1>

              {/* ── Kondisi ada / tidak beasiswa aktif ── */}
              {beasiswaAktif ? (
                <>
                  {/* Sub-judul dari CMS (bila ada) */}
                  {hero.subjudul && <p style={S.subtitle()}>{hero.subjudul}</p>}

                  <p style={S.subtitle()}>Pendaftaran ditutup dalam</p>
                  <Countdown beasiswa={beasiswaAktif} />

                  {/* Tombol CTA dari CMS */}
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
