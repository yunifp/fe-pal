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
    gridTemplateColumns: "260px 1fr",
    gap: 32,
    alignItems: "start",
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    padding: 25,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }),
  fotoWrap: (): React.CSSProperties => ({
    width: 280,
    height: 360,
    background: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e0e0e0",
  }),
  foto: (): React.CSSProperties => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),
  textWrap: (): React.CSSProperties => ({}),
  paragraph: (): React.CSSProperties => ({
    color: "#444",
    fontSize: "0.93rem",
    marginBottom: 12,
    lineHeight: 1.6,
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const TentangBeasiswa = () => (
  <section style={S.section()} id="tentang">
    <div style={S.inner()}>
      <h2 style={S.title()}>
        Tentang Beasiswa SDM Sawit
        <span style={S.titleUnderline()} />
      </h2>
      <div style={S.body()}>
        <div style={S.fotoWrap()}>
          <img
            src="/images/landing/3.png"
            alt="Tentang Beasiswa SDM Sawit"
            style={S.foto()}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div style={S.textWrap()}>
          <p style={S.paragraph()}>
            Beasiswa SDM Sawit adalah program pengembangan sumber daya manusia
            di bidang perkebunan kelapa sawit yang diselenggarakan oleh Badan
            Pengelola Dana Perkebunan (BPDP) bekerja sama dengan Direktorat
            Jenderal Perkebunan, Kementerian Pertanian Republik Indonesia.
          </p>
          <p style={S.paragraph()}>
            Program Beasiswa SDM Sawit merupakan bagian dari upaya strategi
            nasional dalam memperkuat sektor perkebunan kelapa sawit melalui
            peningkatan kualitas sumber daya manusia.
          </p>
          <p style={{ ...S.paragraph(), marginBottom: 0 }}>
            Melalui pendidikan tinggi vokasi dan akademik, program ini dirancang
            untuk mencetak generasi muda yang siap berkontribusi dalam
            pengelolaan industri sawit yang modern, produktif, dan
            berkelanjutan.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default TentangBeasiswa;
