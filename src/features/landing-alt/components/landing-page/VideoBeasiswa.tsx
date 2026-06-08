import { useState, useRef, useEffect } from "react";

// 1. IMPORT GAMBAR DARI FOLDER ASSETS
import GambarPenutup from "../../../../assets/logovideo.png";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  section: (): React.CSSProperties => ({
    padding: "64px 24px",
    background: "#ffffff",
  }),
  inner: (): React.CSSProperties => ({
    maxWidth: 900,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
  videoWrapper: (): React.CSSProperties => ({
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%", /* Aspek rasio 16:9 */
    height: 0,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    background: "#000000",
    border: "1px solid #e0e0e0",
  }),
  thumbnailImg: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),
  overlay: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
  }),
  iframe: (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  }),
  
  // ─── Trik Penutup Judul di Atas ───
  topCoverAgresif: (): React.CSSProperties => ({
    position: "absolute",
    top: "-1px", 
    left: "0px",
    width: "100%", 
    height: "70px", // Tinggi ini menutupi avatar dan judul YouTube
    zIndex: 99999,  
    background: "#000000", 
    cursor: "default",
    pointerEvents: "auto",
  }),

  // ─── Trik Penutup Menggunakan Gambar di Kanan Bawah ───
  logoCoverAgresif: (): React.CSSProperties => ({
    position: "absolute",
    bottom: "0px", 
    right: "0px",
    width: "180px", 
    height: "90px", 
    zIndex: 99999,  
    
    // 2. PASANG GAMBAR SEBAGAI BACKGROUND
    backgroundImage: `url(${GambarPenutup})`,
    backgroundSize: "cover", 
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#000000", 
    
    cursor: "default",
    borderRadius: "0 0 12px 0",
    pointerEvents: "auto",
  }),
};

const CSS_EXTREME = `
  .video-overlay:hover .play-btn {
    transform: scale(1.1);
    background-color: #e65100;
  }
  .play-btn {
    width: 76px; height: 76px;
    background-color: #ff9800; border-radius: 50%;
    display: flex; alignItems: center; justifyContent: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    transition: all 0.2s ease-in-out;
  }
  .play-icon {
    width: 0; height: 0;
    border-top: 14px solid transparent;
    border-bottom: 14px solid transparent;
    border-left: 24px solid #ffffff; margin-left: 6px;
  }
`;

const VideoBeasiswa = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  const videoId = "6Uf_qqAZGhg";
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&iv_load_policy=3`;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isPlaying) {
        e.preventDefault();
        return false;
      }
    };

    const wrapper = videoWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      if (wrapper) {
        wrapper.removeEventListener("contextmenu", handleContextMenu);
      }
    };
  }, [isPlaying]);

  return (
    <>
      <style>{CSS_EXTREME}</style>
      
      <section style={S.section()} id="panduan-pendaftaran">
        <div style={S.inner()}>
          <h2 style={S.title()}>
            Panduan Pendaftaran
            <span style={S.titleUnderline()} />
          </h2>
          
          <div style={S.videoWrapper()} ref={videoWrapperRef}>
            {!isPlaying ? (
              <div 
                className="video-overlay"
                style={S.overlay()} 
                onClick={() => setIsPlaying(true)}
              >
                <img 
                  src={thumbnailUrl} 
                  alt="Panduan Pendaftaran" 
                  style={S.thumbnailImg()} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="play-btn">
                  <div className="play-icon" />
                </div>
              </div>
            ) : (
              <>
                <iframe
                  src={videoUrl}
                  style={S.iframe()}
                  allow="autoplay; encrypted-media"
                  title="Panduan Pendaftaran"
                />
                
                {/* ─── Penutup Judul & Channel di Atas ─── */}
                <div 
                  style={S.topCoverAgresif()} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />

                {/* ─── Penutup Gambar & Blokir Interaksi (Logo Bawah) ─── */}
                <div 
                  style={S.logoCoverAgresif()} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default VideoBeasiswa;