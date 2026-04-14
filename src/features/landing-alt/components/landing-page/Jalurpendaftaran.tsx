import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsJalurPendaftaran } from "@/types/master";
import JalurModal from "./Jalurmodal";

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  section: (): React.CSSProperties => ({
    padding: "64px 24px",
    background: "#f9fbe7",
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
  intro: (): React.CSSProperties => ({
    textAlign: "center",
    color: "#444",
    fontSize: "0.95rem",
    maxWidth: 900,
    margin: "-20px auto 32px",
  }),
  grid: (): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  }),
  card: (): React.CSSProperties => ({
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "default",
  }),
  cardImg: (): React.CSSProperties => ({
    width: "100%",
    height: 220,
    background: "#f5f5f5",
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  }),
  cardImgEl: (): React.CSSProperties => ({
    width: "100%",
    aspectRatio: "10 / 10",
    objectFit: "cover",
  }),
  cardImgPlaceholder: (): React.CSSProperties => ({
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    fontSize: "3rem",
  }),
  cardTitle: (): React.CSSProperties => ({
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 1.4,
  }),
  cardLink: (): React.CSSProperties => ({
    display: "inline-block",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#1b5e20",
    textDecoration: "none",
    border: "1.5px solid #1b5e20",
    padding: "5px 14px",
    borderRadius: 4,
    alignSelf: "flex-start",
    transition: "background 0.2s, color 0.2s",
    background: "none",
    cursor: "pointer",
  }),
  // Skeleton
  skeletonCard: (): React.CSSProperties => ({
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }),
  skeletonImg: (): React.CSSProperties => ({
    width: "100%",
    height: 220,
    background: "#e0e0e0",
    borderRadius: 6,
    animation: "pulse 1.5s ease-in-out infinite",
  }),
  skeletonText: (w = "80%"): React.CSSProperties => ({
    height: 14,
    width: w,
    background: "#e0e0e0",
    borderRadius: 4,
    animation: "pulse 1.5s ease-in-out infinite",
  }),
  skeletonBtn: (): React.CSSProperties => ({
    height: 30,
    width: 120,
    background: "#e0e0e0",
    borderRadius: 4,
    animation: "pulse 1.5s ease-in-out infinite",
  }),
  emptyState: (): React.CSSProperties => ({
    textAlign: "center",
    padding: "60px 0",
    color: "#9e9e9e",
    fontSize: "0.95rem",
  }),
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div style={S.skeletonCard()}>
    <div style={S.skeletonImg()} />
    <div style={S.skeletonText("70%")} />
    <div style={S.skeletonText("90%")} />
    <div style={S.skeletonBtn()} />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const JalurPendaftaran = () => {
  const [activeJalur, setActiveJalur] = useState<ICmsJalurPendaftaran | null>(
    null,
  );

  const {
    data: jalurResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-jalur-aktif"],
    queryFn: () => masterService.getCmsJalurAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jalurList: ICmsJalurPendaftaran[] = jalurResponse?.data ?? [];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <section style={S.section()} id="jalur-pendaftaran">
        <div style={S.inner()}>
          <h2 style={S.title()}>
            Jalur Pendaftaran
            <span style={S.titleUnderline()} />
          </h2>
          <p style={S.intro()}>
            Program Beasiswa SDM Sawit terbuka bagi berbagai latar belakang yang
            memiliki keterkaitan dengan sektor perkebunan kelapa sawit. Pilih
            jalur pendaftaran sesuai dengan profil Anda.
          </p>

          {/* ── Loading ── */}
          {isLoading && (
            <div style={S.grid()}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {isError && (
            <div style={S.emptyState()}>
              Gagal memuat data jalur pendaftaran. Silakan coba lagi.
            </div>
          )}

          {/* ── Empty ── */}
          {!isLoading && !isError && jalurList.length === 0 && (
            <div style={S.emptyState()}>
              Belum ada jalur pendaftaran yang tersedia.
            </div>
          )}

          {/* ── Data ── */}
          {!isLoading && !isError && jalurList.length > 0 && (
            <div style={S.grid()}>
              {jalurList.map((jalur) => (
                <div key={jalur.id} style={S.card()}>
                  <div style={S.cardImg()}>
                    {jalur.gambar_url ? (
                      <img
                        src={jalur.gambar_url}
                        alt={jalur.judul}
                        style={S.cardImgEl()}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={S.cardImgPlaceholder()}>🌴</div>
                    )}
                  </div>
                  <p style={S.cardTitle()}>{jalur.judul}</p>
                  <button
                    style={S.cardLink()}
                    onClick={() => setActiveJalur(jalur)}>
                    SELENGKAPNYA
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeJalur && (
        <JalurModal jalur={activeJalur} onClose={() => setActiveJalur(null)} />
      )}
    </>
  );
};

export default JalurPendaftaran;
