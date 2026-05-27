import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsTentang } from "@/types/master";

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
  body: (isMobile: boolean): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
    gap: isMobile ? 32 : 48,
    alignItems: "center",
  }),
  bodyNoImg: (): React.CSSProperties => ({
    maxWidth: 860,
    margin: "0 auto",
  }),
  imgWrap: (): React.CSSProperties => ({
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    background: "#f5f5f5",
  }),
  img: (): React.CSSProperties => ({
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "cover",
  }),
  skeletonLine: (w = "100%", h = 16): React.CSSProperties => ({
    height: h,
    width: w,
    background: "#e0e0e0",
    borderRadius: 4,
    animation: "tentang-pulse 1.5s ease-in-out infinite",
  }),
  skeletonImg: (): React.CSSProperties => ({
    width: "100%",
    height: 280,
    background: "#e0e0e0",
    borderRadius: 12,
    animation: "tentang-pulse 1.5s ease-in-out infinite",
  }),
};

const TENTANG_DEFAULTS: ICmsTentang = {
  id: 0,
  judul_section: "Tentang Beasiswa",
  deskripsi:
    "<p>Melalui pendidikan tinggi vokasi dan akademik, program ini dirancang untuk mencetak generasi muda yang siap berkontribusi dalam pengelolaan industri sawit yang modern, produktif, dan berkelanjutan.</p>",
  gambar_url: null,
  is_active: 1,
  created_by: null,
  updated_by: null,
};

const isHtmlContent = (str: string): boolean => /<[a-z][\s\S]*>/i.test(str);
const plainTextToHtml = (text: string): string =>
  text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, " ").trim()}</p>`)
    .join("");

const PROSE_STYLES = `
  @keyframes tentang-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .tentang-prose {
    font-size: 0.97rem;
    color: #444;
    line-height: 1.8;
  }
  .tentang-prose p { margin: 0 0 0.85em; }
  .tentang-prose p:last-child { margin-bottom: 0; }
  .tentang-prose h2 { font-size: 1.25em; font-weight: 700; color: #1b5e20; margin: 1em 0 0.5em; line-height: 1.3; }
  .tentang-prose h3 { font-size: 1.1em; font-weight: 600; color: #2e7d32; margin: 0.9em 0 0.4em; line-height: 1.35; }
  .tentang-prose ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0 0.85em; }
  .tentang-prose ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0 0.85em; }
  .tentang-prose li { margin-bottom: 0.3em; }
  .tentang-prose b, .tentang-prose strong { font-weight: 700; color: #333; }
  .tentang-prose i, .tentang-prose em { font-style: italic; }
  .tentang-prose u { text-decoration: underline; }
  .tentang-prose s, .tentang-prose strike { text-decoration: line-through; color: #888; }
  .tentang-prose a { color: #1b5e20; text-decoration: underline; transition: color 0.15s; }
  .tentang-prose a:hover { color: #ff9800; }
  .tentang-prose hr { border: none; border-top: 1px solid #e0e0e0; margin: 1em 0; }
`;

const TentangBeasiswa = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: tentangResponse, isLoading } = useQuery({
    queryKey: ["cms-tentang-aktif"],
    queryFn: () => masterService.getCmsTentangAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const tentang: ICmsTentang = tentangResponse?.data ?? TENTANG_DEFAULTS;
  const hasImage = Boolean(tentang.gambar_url);
  const deskripsiHtml = tentang.deskripsi
    ? isHtmlContent(tentang.deskripsi)
      ? tentang.deskripsi
      : plainTextToHtml(tentang.deskripsi)
    : null;

  return (
    <>
      <style>{PROSE_STYLES}</style>

      <section style={S.section()} id="tentang">
        <div style={S.inner()}>
          <h2 style={S.title()}>
            {isLoading
              ? "Tentang Beasiswa"
              : tentang.judul_section || "Tentang Beasiswa"}
            <span style={S.titleUnderline()} />
          </h2>

          {isLoading ? (
            <div style={S.body(isMobile)}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[100, 90, 95, 85, 100, 70, 80].map((w, i) => (
                  <div key={i} style={S.skeletonLine(`${w}%`)} />
                ))}
              </div>
              <div style={S.skeletonImg()} />
            </div>
          ) : (
            <div style={hasImage ? S.body(isMobile) : S.bodyNoImg()}>
              {deskripsiHtml ? (
                <div
                  className="tentang-prose"
                  dangerouslySetInnerHTML={{ __html: deskripsiHtml }}
                />
              ) : null}

              {hasImage && (
                <div style={S.imgWrap()}>
                  <img
                    src={tentang.gambar_url!}
                    alt={tentang.judul_section || "Tentang Beasiswa"}
                    style={S.img()}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default TentangBeasiswa;