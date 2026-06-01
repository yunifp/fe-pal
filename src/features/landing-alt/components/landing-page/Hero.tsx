import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { masterService } from "../../../../services/masterService";
import { STALE_TIME } from "../../../../constants/reactQuery";
import Countdown from "./Countdown";
import type { IBeasiswa } from "../../../../types/beasiswa";
import type { ICmsHero } from "../../../../types/master";

// ─── Styles ───────────────────────────────────────────
const S = {
  section: (): React.CSSProperties => ({
    position: "relative",
    height: "100vh", 
    minHeight: "700px", // Ditambah sedikit agar countdown punya ruang lega di bawah
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", 
    backgroundColor: "#111", 
  }),

  // ── Wrapper Utama Slider ──
  sliderWrapper: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    overflow: "hidden",
  }),

  // ── Track yang akan Bergeser (Sliding) Kiri-Kanan ──
  sliderTrack: (currentIdx: number, totalSlides: number): React.CSSProperties => ({
    display: "flex",
    height: "100%",
    width: `${totalSlides * 100}%`,
    transform: `translateX(-${(currentIdx * 100) / totalSlides}%)`,
    transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)", 
  }),

  // ── Item per Slide (Gambar + Text + Tombol) ──
  slideItem: (totalSlides: number): React.CSSProperties => ({
    position: "relative",
    width: `${100 / totalSlides}%`,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 20px",
  }),

  slideBg: (bgUrl: string): React.CSSProperties => ({
    position: "absolute",
    top: 0, 
    left: 0, 
    width: "100%", 
    height: "100%",
    backgroundImage: `url('${bgUrl}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1,
  }),

  overlay: (): React.CSSProperties => ({
    position: "absolute",
    top: 0, 
    left: 0, 
    width: "100%", 
    height: "100%",
    backgroundImage: "linear-gradient(rgba(46,125,50,0.6), rgba(255,152,0,0.7))",
    zIndex: 0,
  }),

  contentContainer: (): React.CSSProperties => ({
    position: "relative",
    zIndex: 10,
    maxWidth: 800,
    width: "100%",
    transform: "translateY(-60px)", // Naikkan sedikit agar tidak nabrak Countdown Card
  }),

  // ── Tombol Navigasi Manual (Solid, tanpa blur) ──
  navBtn: (direction: "left" | "right", isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [direction]: isMobile ? "12px" : "32px",
    zIndex: 30,
    width: isMobile ? "40px" : "54px",
    height: isMobile ? "40px" : "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.4)", // Solid transparent black
    border: "1px solid rgba(255, 255, 255, 0.4)",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }),

  // ── Area Statis Bawah (Countdown) ──
  staticSection: (isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    bottom: isMobile ? "32px" : "48px", 
    left: 0,
    right: 0,
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    width: "100%",
  }),

  // ── Typography & Buttons ──
  title: (): React.CSSProperties => ({
    fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
    fontWeight: 900, 
    color: "#ffffff",
    letterSpacing: "0.02em",
    marginBottom: 16,
    textShadow: "0 4px 24px rgba(0,0,0,0.5)", 
  }),
  subtitle: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 600, 
    color: "#ffffff", 
    textShadow: "0 2px 8px rgba(0,0,0,0.4)", 
    marginBottom: 24,
  }),
  subtitleNoBeasiswa: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 600, 
    color: "#ffffff",
    maxWidth: 500,
    margin: "0 auto",
    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
    background: "rgba(0,0,0,0.6)",
    padding: "16px 24px",
    borderRadius: "8px"
  }),
  buttonGroup: (): React.CSSProperties => ({
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "16px"
  }),
  cta: (): React.CSSProperties => ({
    display: "inline-block",
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
  ctaSecondary: (): React.CSSProperties => ({
    display: "inline-block",
    padding: "14px 36px",
    background: "rgba(0, 0, 0, 0.3)", // Solid semi transparent dark
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: 50,
    textDecoration: "none",
    border: "2px solid rgba(255, 255, 255, 0.8)",
    transition: "background 0.2s, transform 0.2s",
  }),
};

const HERO_DEFAULTS: ICmsHero = {
  id: 0,
  judul: "BEASISWA SDM SAWIT",
  subjudul: "Program Beasiswa Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit Indonesia",
  bg_image_url: "/images/bg_beasiswa.png",
  bg_image_url_2: null,
  bg_image_url_3: null,
  label_cta: "Daftar Sekarang",
  url_cta: "/daftar-penerima-beasiswa",
  label_cta_2: null,
  url_cta_2: null,
  
  judul_2: null, subjudul_2: null, s2_label_cta: null, s2_url_cta: null, s2_label_cta_2: null, s2_url_cta_2: null,
  judul_3: null, subjudul_3: null, s3_label_cta: null, s3_url_cta: null, s3_label_cta_2: null, s3_url_cta_2: null,
  
  is_active: 1, created_at: "", updated_at: "", created_by: null, updated_by: null,
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

  const slides: Array<{
    img: string; title: string; subtitle: string;
    cta1Text: string; cta1Url: string; cta2Text: string; cta2Url: string;
  }> = [];

  if (hero) {
    slides.push({
      img: hero.bg_image_url || "/images/bg_beasiswa.png",
      title: hero.judul,
      subtitle: hero.subjudul || "",
      cta1Text: hero.label_cta || "Daftar Sekarang", cta1Url: hero.url_cta || "/daftar-penerima-beasiswa",
      cta2Text: hero.label_cta_2 || "", cta2Url: hero.url_cta_2 || "",
    });

    if (hero.bg_image_url_2) {
      slides.push({
        img: hero.bg_image_url_2,
        title: hero.judul_2 || hero.judul, 
        subtitle: hero.subjudul_2 || hero.subjudul || "",
        cta1Text: hero.s2_label_cta || hero.label_cta || "Daftar", cta1Url: hero.s2_url_cta || hero.url_cta || "",
        cta2Text: hero.s2_label_cta_2 || hero.label_cta_2 || "", cta2Url: hero.s2_url_cta_2 || hero.url_cta_2 || "",
      });
    }

    if (hero.bg_image_url_3) {
      slides.push({
        img: hero.bg_image_url_3,
        title: hero.judul_3 || hero.judul,
        subtitle: hero.subjudul_3 || hero.subjudul || "",
        cta1Text: hero.s3_label_cta || hero.label_cta || "Daftar", cta1Url: hero.s3_url_cta || hero.url_cta || "",
        cta2Text: hero.s3_label_cta_2 || hero.label_cta_2 || "", cta2Url: hero.s3_url_cta_2 || hero.url_cta_2 || "",
      });
    }
  }

  // Auto Slider Timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, currentIdx]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <>
      <style>{`
        .btn-nav-slider:hover {
          background: rgba(0, 0, 0, 0.7) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        .btn-secondary-hero:hover {
          background-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>

      <section id="beranda" style={S.section()}>
        {/* === BACKGROUND & KONTEN SLIDER === */}
        <div style={S.sliderWrapper()}>
          <div style={S.sliderTrack(currentIdx, slides.length)}>
            {slides.map((slide, idx) => (
              <div key={idx} style={S.slideItem(slides.length)}>
                
                <div style={S.slideBg(slide.img)} />
                <div style={S.overlay()} />
                
                <div style={S.contentContainer()}>
                  <h1 style={S.title()}>{slide.title}</h1>
                  {beasiswaAktif && slide.subtitle && (
                    <p style={S.subtitle()}>{slide.subtitle}</p>
                  )}

                  {beasiswaAktif && !isPendaftaranTutup && (
                    <div style={S.buttonGroup()}>
                      {slide.cta1Url && (
                        <a href={slide.cta1Url} style={S.cta()}>
                          {slide.cta1Text}
                        </a>
                      )}
                      {slide.cta2Url && (
                        <a href={slide.cta2Url} target="_blank" rel="noopener noreferrer" className="btn-secondary-hero" style={S.ctaSecondary()}>
                          {slide.cta2Text}
                        </a>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* === TOMBOL NAVIGASI KIRI & KANAN === */}
        {!isHeroLoading && slides.length > 1 && (
          <>
            <button onClick={handlePrev} className="btn-nav-slider" style={S.navBtn("left", isMobile)}>
              <ChevronLeft size={isMobile ? 24 : 32} />
            </button>
            <button onClick={handleNext} className="btn-nav-slider" style={S.navBtn("right", isMobile)}>
              <ChevronRight size={isMobile ? 24 : 32} />
            </button>
          </>
        )}

        {/* === KONTEN STATIS COUNTDOWN === */}
        {!isHeroLoading && (
          beasiswaAktif ? (
            <div style={S.staticSection(isMobile)}>
              {/* Teks "Pendaftaran ditutup dalam" tidak perlu di-render di sini karena sudah ada di dalam Card Countdown */}
              <Countdown beasiswa={beasiswaAktif} onTimeUp={onTimeUp} />
            </div>
          ) : (
            <div style={S.staticSection(isMobile)}>
                <p style={S.subtitleNoBeasiswa()}>
                  Saat ini belum ada beasiswa yang sedang dibuka. Pantau terus halaman ini.
                </p>
            </div>
          )
        )}
      </section>
    </>
  );
};

export default Hero;