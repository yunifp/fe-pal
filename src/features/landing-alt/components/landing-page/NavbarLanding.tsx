import { useEffect, useState } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  nav: (scrolled: boolean): React.CSSProperties => ({
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: "#ffffff",
    boxShadow: scrolled
      ? "0 4px 20px rgba(0,0,0,0.12)"
      : "0 1px 4px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.3s",
  }),
  inner: (): React.CSSProperties => ({
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  }),
  logoWrap: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  }),
  logoImg: (): React.CSSProperties => ({
    height: 40,
    width: "auto",
  }),
  skeletonLogo: (): React.CSSProperties => ({
    width: 120,
    height: 36,
    background: "#e0e0e0",
    borderRadius: 6,
  }),
  skeletonLinks: (): React.CSSProperties => ({
    width: 260,
    height: 32,
    background: "#e0e0e0",
    borderRadius: 6,
  }),
  desktop: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 24,
  }),
  navLinks: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
  }),
  navLink: (): React.CSSProperties => ({
    textDecoration: "none",
    color: "#444",
    fontSize: "0.9rem",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: 6,
    transition: "color 0.2s, background 0.2s",
  }),
  auth: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
  }),
  btnDaftar: (full?: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "7px 16px",
    borderRadius: 7,
    border: "1.5px solid #f59e0b",
    color: "#f59e0b",
    background: "transparent",
    transition: "background 0.2s, color 0.2s",
    whiteSpace: "nowrap",
    cursor: "pointer",
    ...(full ? { width: "100%", justifyContent: "center" } : {}),
  }),
  btnMasuk: (full?: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "7px 16px",
    borderRadius: 7,
    background: "#2e7d32",
    color: "#ffffff",
    border: "1.5px solid #2e7d32",
    transition: "background 0.2s, border-color 0.2s",
    whiteSpace: "nowrap",
    cursor: "pointer",
    ...(full ? { width: "100%", justifyContent: "center" } : {}),
  }),
  hamburger: (): React.CSSProperties => ({
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#444",
    padding: 4,
    transition: "color 0.2s",
  }),
  mobileMenu: (open: boolean): React.CSSProperties => ({
    display: open ? "flex" : "none",
    flexDirection: "column",
    background: "#ffffff",
    borderTop: "1px solid #f5f5f5",
    padding: open ? "12px 16px 16px" : "0 16px",
  }),
  mobileLink: (): React.CSSProperties => ({
    display: "block",
    textDecoration: "none",
    color: "#444",
    fontSize: "0.9rem",
    fontWeight: 500,
    padding: "10px 12px",
    borderRadius: 6,
  }),
  mobileAuth: (): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
    paddingTop: 12,
    borderTop: "1px solid #f5f5f5",
  }),
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconDaftar = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const IconMasuk = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface NavbarProps {
  hasBeasiswaAktif: boolean;
  isBeasiswaLoading: boolean;
}

const NavbarLanding = ({
  hasBeasiswaAktif,
  isBeasiswaLoading,
}: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => setMenuOpen(false);

  if (isBeasiswaLoading) {
    return (
      <nav style={S.nav(false)}>
        <div style={S.inner()}>
          <div style={S.skeletonLogo()} />
          <div style={S.skeletonLinks()} />
        </div>
      </nav>
    );
  }

  return (
    <nav style={S.nav(isScrolled)}>
      <div style={S.inner()}>
        {/* Logo */}
        <div style={S.logoWrap()}>
          <img
            src="/images/landing/logo.png"
            alt="BPDP Logo"
            style={S.logoImg()}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Desktop nav */}
        <div style={S.desktop()}>
          <div style={S.navLinks()}>
            <a href="/" style={S.navLink()}>
              Beranda
            </a>
            <a
              href="#jalur-pendaftaran"
              onClick={handleLinkClick}
              style={S.mobileLink()}>
              Jalur Pendaftaran
            </a>
            {/* <a href="/pendaftaran-beasiswa" style={S.navLink()}>
              Beasiswa
            </a> */}
            <a href="#kontak" style={S.navLink()}>
              Kontak
            </a>
            {/* <a href="#tentang" onClick={handleLinkClick} style={S.mobileLink()}>
              Tentang
            </a> */}
          </div>
          <div style={S.auth()}>
            {hasBeasiswaAktif && (
              <a href="/daftar-penerima-beasiswa" style={S.btnDaftar()}>
                <IconDaftar />
                Daftar
              </a>
            )}
            <a href="/login" style={S.btnMasuk()}>
              <IconMasuk />
              Masuk
            </a>
          </div>
        </div>

        {/* Hamburger */}
        <button
          style={S.hamburger()}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu">
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={S.mobileMenu(menuOpen)}>
        <a href="/" onClick={handleLinkClick} style={S.mobileLink()}>
          Beranda
        </a>
        <a
          href="/pendaftaran-beasiswa"
          onClick={handleLinkClick}
          style={S.mobileLink()}>
          Beasiswa
        </a>
        <a href="#kontak" onClick={handleLinkClick} style={S.mobileLink()}>
          Kontak
        </a>
        <a href="#tentang" onClick={handleLinkClick} style={S.mobileLink()}>
          Tentang
        </a>
        <div style={S.mobileAuth()}>
          {hasBeasiswaAktif && (
            <a
              href="/daftar-penerima-beasiswa"
              onClick={handleLinkClick}
              style={S.btnDaftar(true)}>
              <IconDaftar />
              Daftar
            </a>
          )}
          <a href="/login" onClick={handleLinkClick} style={S.btnMasuk(true)}>
            <IconMasuk />
            Masuk
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLanding;
