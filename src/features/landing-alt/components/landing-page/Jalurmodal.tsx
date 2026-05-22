import { useEffect } from "react";
import type { ICmsJalurPendaftaran } from "@/types/master";

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
  emptyList: (): React.CSSProperties => ({
    fontSize: "0.82rem",
    color: "#bdbdbd",
    fontStyle: "italic",
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

// ─── Prose CSS (scoped to .jm-prose) ─────────────────────────────────────────

const PROSE_CSS = `
  .jm-prose {
    font-size: 0.92rem;
    color: #444;
    line-height: 1.65;
  }
  .jm-prose h2 {
    font-size: 1rem;
    font-weight: 700;
    color: #1b5e20;
    margin: 12px 0 6px;
  }
  .jm-prose h3 {
    font-size: 0.93rem;
    font-weight: 700;
    color: #2e7d32;
    margin: 10px 0 4px;
  }
  .jm-prose p  { margin: 0 0 8px; }
  .jm-prose p:last-child { margin-bottom: 0; }
  .jm-prose strong { font-weight: 700; }
  .jm-prose em     { font-style: italic; }
  .jm-prose u      { text-decoration: underline; }
  .jm-prose code {
    font-family: monospace;
    font-size: 0.83em;
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 3px;
  }
  .jm-prose ul {
    list-style: disc;
    padding-left: 20px;
    margin: 6px 0 8px;
  }
  .jm-prose ol {
    list-style: decimal;
    padding-left: 20px;
    margin: 6px 0 8px;
  }
  .jm-prose li { margin-bottom: 3px; }
  .jm-prose blockquote {
    border-left: 3px solid #a5d6a7;
    padding-left: 12px;
    margin: 8px 0;
    color: #666;
    font-style: italic;
  }
  .jm-prose hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 12px 0;
  }
  .jm-prose a {
    color: #1b5e20;
    text-decoration: underline;
  }
  .jm-prose a:hover { color: #2e7d32; }
  .jm-prose img {
    max-width: 100%;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    margin: 8px 0;
    display: block;
  }
  /* Text-align from Tiptap inline styles */
  .jm-prose [style*="text-align: center"],
  .jm-prose [style*="text-align:center"] { text-align: center; }
  .jm-prose [style*="text-align: right"],
  .jm-prose [style*="text-align:right"]  { text-align: right; }
`;

// ─── Props ────────────────────────────────────────────────────────────────────

interface JalurModalProps {
  jalur: ICmsJalurPendaftaran;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  }, [onClose]);

  const syaratList = [...(jalur.syarat ?? [])].sort(
    (a, b) => a.urutan - b.urutan,
  );
  const dokumenList = [...(jalur.dokumen ?? [])].sort(
    (a, b) => a.urutan - b.urutan,
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        ${PROSE_CSS}
      `}</style>

      <div style={S.overlay()} onClick={onClose}>
        <div style={S.box()} onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div style={S.header()}>
            <div style={S.headerText()}>
              <span style={S.badge()}>Jalur {jalur.id}</span>
              <h3 style={S.title()}>{jalur.judul}</h3>
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

          {/* ── Body ── */}
          <div style={S.body()}>
            {/* Deskripsi — render HTML dari WYSIWYG */}
            {jalur.deskripsi && (
              <div
                className="jm-prose"
                dangerouslySetInnerHTML={{ __html: jalur.deskripsi }}
              />
            )}

            <div style={S.cols()}>
              {/* Persyaratan */}
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
                  Dokumen Umum
                </h4>
                {syaratList.length > 0 ? (
                  <ul style={S.list()}>
                    {syaratList.map((s) => (
                      <li key={s.id} style={S.listItem()}>
                        <span style={S.dotGreen()} />
                        {s.syarat}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={S.emptyList()}>Belum ada persyaratan.</p>
                )}
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
                  Dokumen Khusus
                </h4>
                {dokumenList.length > 0 ? (
                  <ul style={S.list()}>
                    {dokumenList.map((d) => (
                      <li key={d.id} style={S.listItem()}>
                        <span style={S.dotOrange()} />
                        {d.dokumen}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={S.emptyList()}>Belum ada dokumen.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
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
