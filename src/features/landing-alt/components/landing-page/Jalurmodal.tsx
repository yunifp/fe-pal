import { useEffect } from "react";
import type { JalurDetail } from "./Jalurpendaftaran";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  overlay: (): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    animation: "fadeIn 0.2s ease",
  }),
  box: (): React.CSSProperties => ({
    background: "#ffffff",
    borderRadius: 14,
    width: "100%",
    maxWidth: 740,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    animation: "slideUp 0.25s ease",
    overflow: "hidden",
  }),
  header: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: "20px 24px 16px",
    borderBottom: "1px solid #e0e0e0",
    background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
  }),
  headerText: (): React.CSSProperties => ({
    flex: 1,
  }),
  badge: (): React.CSSProperties => ({
    display: "inline-block",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.9)",
    padding: "3px 10px",
    borderRadius: 50,
    marginBottom: 6,
  }),
  title: (): React.CSSProperties => ({
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.4,
  }),
  closeBtn: (): React.CSSProperties => ({
    background: "rgba(255,255,255,0.15)",
    border: "none",
    cursor: "pointer",
    color: "#ffffff",
    borderRadius: 8,
    padding: 6,
    flexShrink: 0,
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  body: (): React.CSSProperties => ({
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  }),
  desc: (): React.CSSProperties => ({
    fontSize: "0.92rem",
    color: "#444",
    lineHeight: 1.65,
  }),
  chips: (): React.CSSProperties => ({
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  }),
  chipGreen: (): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 50,
    background: "#e8f5e9",
    color: "#1b5e20",
    border: "1px solid #a5d6a7",
  }),
  chipOrange: (): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 50,
    background: "#fff3e0",
    color: "#f57c00",
    border: "1px solid #ffcc80",
  }),
  cols: (): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  }),
  sectionTitle: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#1b5e20",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: "2px solid #ff9800",
  }),
  list: (): React.CSSProperties => ({
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    padding: 0,
    margin: 0,
  }),
  listItem: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: "0.85rem",
    color: "#444",
    lineHeight: 1.45,
  }),
  dotGreen: (): React.CSSProperties => ({
    flexShrink: 0,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#2e7d32",
    marginTop: 5,
  }),
  dotOrange: (): React.CSSProperties => ({
    flexShrink: 0,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#ff9800",
    marginTop: 5,
  }),
  footer: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    padding: "14px 24px",
    borderTop: "1px solid #e0e0e0",
    background: "#f5f5f5",
  }),
  btnSecondary: (): React.CSSProperties => ({
    background: "none",
    border: "1.5px solid #e0e0e0",
    color: "#444",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "8px 20px",
    borderRadius: 7,
    cursor: "pointer",
    transition: "border-color 0.2s, color 0.2s",
  }),
  btnPrimary: (): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    background: "#2e7d32",
    color: "#ffffff",
    fontSize: "0.875rem",
    fontWeight: 700,
    padding: "8px 22px",
    borderRadius: 7,
    transition: "background 0.2s",
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

interface JalurModalProps {
  jalur: JalurDetail;
  onClose: () => void;
}

const JalurModal = ({ jalur, onClose }: JalurModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={S.overlay()} onClick={onClose}>
        <div style={S.box()} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={S.header()}>
            <div style={S.headerText()}>
              <span style={S.badge()}>Jalur {jalur.id}</span>
              <h3 style={S.title()}>{jalur.title}</h3>
            </div>
            <button style={S.closeBtn()} onClick={onClose} aria-label="Tutup">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={S.body()}>
            <p style={S.desc()}>{jalur.deskripsi}</p>

            {/* <div style={S.chips()}>
              <div style={S.chipGreen()}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Kuota: <strong>{jalur.kuota} mahasiswa</strong>
              </div>
              {jalur.jenjang.map((j) => (
                <div key={j} style={S.chipOrange()}>
                  {j}
                </div>
              ))}
            </div> */}

            <div style={S.cols()}>
              {/* Syarat */}
              <div>
                <h4 style={S.sectionTitle()}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Persyaratan
                </h4>
                <ul style={S.list()}>
                  {jalur.syarat.map((s, i) => (
                    <li key={i} style={S.listItem()}>
                      <span style={S.dotGreen()} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dokumen */}
              <div>
                <h4 style={S.sectionTitle()}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Dokumen yang Dibutuhkan
                </h4>
                <ul style={S.list()}>
                  {jalur.dokumen.map((d, i) => (
                    <li key={i} style={S.listItem()}>
                      <span style={S.dotOrange()} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={S.footer()}>
            <button style={S.btnSecondary()} onClick={onClose}>
              Tutup
            </button>
            <a href="/daftar-penerima-beasiswa" style={S.btnPrimary()}>
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default JalurModal;
