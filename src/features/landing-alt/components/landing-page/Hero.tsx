import Countdown from "./Countdown";
import type { IBeasiswa } from "@/types/beasiswa";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: (): React.CSSProperties => ({
    minHeight: "100vh",
    background:
      "linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg_beasiswa.png')",
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
    marginBottom: 20,
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
};

// ─── Component ────────────────────────────────────────────────────────────────

// interface HeroProps {
//   beasiswaAktif: any;
// }

interface HeroProps {
  beasiswaAktif: IBeasiswa | null;
}

const Hero = ({ beasiswaAktif }: HeroProps) => {
  return (
    <section style={S.section()}>
      <div style={S.content()}>
        <h1 style={S.title()}>BEASISWA SDM SAWIT</h1>
        {beasiswaAktif ? (
          <>
            <p style={S.subtitle()}>Pendaftaran ditutup dalam</p>
            <Countdown beasiswa={beasiswaAktif} />
            <a href="/daftar-penerima-beasiswa" style={S.cta()}>
              Daftar Sekarang
            </a>
          </>
        ) : (
          <p style={S.subtitleNoBeasiswa()}>
            Saat ini belum ada beasiswa yang sedang dibuka. Pantau terus halaman
            ini.
          </p>
        )}
      </div>
    </section>
  );
};

export default Hero;
