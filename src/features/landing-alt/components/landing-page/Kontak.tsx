import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsKontak } from "@/types/master";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: (): React.CSSProperties => ({
    padding: "64px 24px",
    background: "#ffffff",
  }),
  inner: (): React.CSSProperties => ({
    maxWidth: 1100,
    margin: "0 auto",
  }),
  title: (): React.CSSProperties => ({
    fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
    fontWeight: 700,
    color: "#1b5e20",
    textAlign: "center",
    marginBottom: 36,
    position: "relative",
  }),
  titleUnderline: (): React.CSSProperties => ({
    display: "block",
    width: 60,
    height: 4,
    background: "#ff9800",
    borderRadius: 2,
    margin: "12px auto 0",
  }),
  body: (): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: 0,
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }),
  mapWrap: (): React.CSSProperties => ({
    minHeight: 260,
    background: "#f5f5f5",
    position: "relative",
  }),
  iframe: (): React.CSSProperties => ({
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: 260,
    border: 0,
  }),
  mapPlaceholder: (): React.CSSProperties => ({
    width: "100%",
    height: "100%",
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#f5f5f5",
    color: "#bdbdbd",
    fontSize: "0.85rem",
  }),
  info: (): React.CSSProperties => ({
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderLeft: "1px solid #e0e0e0",
    background: "#fafafa",
  }),
  infoTitle: (): React.CSSProperties => ({
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1b5e20",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "2px solid #ff9800",
  }),
  infoRow: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "0.875rem",
    color: "#444",
    lineHeight: 1.5,
  }),
  infoIcon: (): React.CSSProperties => ({
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#e8f5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  }),
  infoLabel: (): React.CSSProperties => ({
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 2,
  }),
  infoValue: (): React.CSSProperties => ({
    fontSize: "0.875rem",
    color: "#1a1a1a",
    wordBreak: "break-word",
  }),
  // Skeleton
  skeletonBlock: (h = 20, w = "100%"): React.CSSProperties => ({
    height: h,
    width: w,
    background: "#e0e0e0",
    borderRadius: 4,
    animation: "pulse 1.5s ease-in-out infinite",
  }),
};

// ─── Fallback defaults ────────────────────────────────────────────────────────

const KONTAK_DEFAULTS: ICmsKontak = {
  id: 0,
  judul_section: "Kontak",
  nama_instansi: null,
  alamat: null,
  telepon: null,
  email: null,
  whatsapp: null,
  jam_operasional: null,
  maps_embed_url: null,
  maps_lat: null,
  maps_lng: null,
  is_active: 1,
  created_by: null,
  updated_by: null,
};

// ─── Sub-component: satu baris info ──────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

const InfoRow = ({ icon, label, value, href }: InfoRowProps) => (
  <div style={S.infoRow()}>
    <div style={S.infoIcon()}>{icon}</div>
    <div>
      <div style={S.infoLabel()}>{label}</div>
      {href ? (
        <a
          href={href}
          style={{
            ...S.infoValue(),
            color: "#1b5e20",
            textDecoration: "none",
          }}>
          {value}
        </a>
      ) : (
        <div style={S.infoValue()}>{value}</div>
      )}
    </div>
  </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconPhone = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.79 19.79 0 0 1 .22 1.2 2 2 0 0 1 2.18 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.91 7.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconWhatsapp = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconClock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconPin = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Kontak = () => {
  const { data: kontakResponse, isLoading } = useQuery({
    queryKey: ["cms-kontak-aktif"],
    queryFn: () => masterService.getCmsKontakAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kontak: ICmsKontak = kontakResponse?.data ?? KONTAK_DEFAULTS;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <section style={S.section()} id="kontak">
        <div style={S.inner()}>
          <h2 style={S.title()}>
            {isLoading ? "Kontak" : kontak.judul_section || "Kontak"}
            <span style={S.titleUnderline()} />
          </h2>

          <div style={S.body()}>
            {/* ── Peta ── */}
            <div style={S.mapWrap()}>
              {isLoading ? (
                <div
                  style={{
                    ...S.mapPlaceholder(),
                    background: "#e0e0e0",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ) : kontak.maps_embed_url ? (
                <iframe
                  title="Lokasi Kantor"
                  src={kontak.maps_embed_url}
                  style={S.iframe()}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div style={S.mapPlaceholder()}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Peta belum dikonfigurasi</span>
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div style={S.info()}>
              {isLoading ? (
                // Skeleton
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}>
                      <div style={S.skeletonBlock(32, "32px")} />
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}>
                        <div style={S.skeletonBlock(10, "40%")} />
                        <div style={S.skeletonBlock(14, "80%")} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={S.infoTitle()}>
                    {kontak.nama_instansi || "Informasi Kontak"}
                  </div>

                  {kontak.telepon && (
                    <InfoRow
                      icon={<IconPhone />}
                      label="Telepon"
                      value={kontak.telepon}
                      href={`tel:${kontak.telepon}`}
                    />
                  )}

                  {kontak.email && (
                    <InfoRow
                      icon={<IconMail />}
                      label="Email"
                      value={kontak.email}
                      href={`mailto:${kontak.email}`}
                    />
                  )}

                  {kontak.whatsapp && (
                    <InfoRow
                      icon={<IconWhatsapp />}
                      label="WhatsApp"
                      value={kontak.whatsapp}
                      href={`https://wa.me/${kontak.whatsapp.replace(/\D/g, "")}`}
                    />
                  )}

                  {kontak.jam_operasional && (
                    <InfoRow
                      icon={<IconClock />}
                      label="Jam Operasional"
                      value={kontak.jam_operasional}
                    />
                  )}

                  {kontak.alamat && (
                    <InfoRow
                      icon={<IconPin />}
                      label="Alamat"
                      value={kontak.alamat}
                    />
                  )}

                  {/* Fallback jika semua field null */}
                  {!kontak.telepon &&
                    !kontak.email &&
                    !kontak.whatsapp &&
                    !kontak.jam_operasional &&
                    !kontak.alamat && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#bdbdbd",
                          fontStyle: "italic",
                          marginTop: 8,
                        }}>
                        Informasi kontak belum tersedia.
                      </p>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Kontak;
