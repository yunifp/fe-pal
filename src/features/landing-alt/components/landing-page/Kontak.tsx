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
    gridTemplateColumns: "1fr 220px",
    gap: 24,
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }),
  mapWrap: (): React.CSSProperties => ({
    minHeight: 200,
    background: "#f5f5f5",
  }),
  iframe: (): React.CSSProperties => ({
    display: "block",
    minHeight: 200,
    border: 0,
  }),
  info: (): React.CSSProperties => ({
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: "0.9rem",
    color: "#444",
  }),
  strong: (): React.CSSProperties => ({
    color: "#1a1a1a",
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const Kontak = () => (
  <section style={S.section()} id="kontak">
    <div style={S.inner()}>
      <h2 style={S.title()}>
        Kontak
        <span style={S.titleUnderline()} />
      </h2>
      <div style={S.body()}>
        <div style={S.mapWrap()}>
          <iframe
            title="Lokasi Kantor"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2993993254967!2d106.8272!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNDknMzguMCJF!5e0!3m2!1sen!2sid!4v1234567890"
            width="100%"
            height="200"
            style={S.iframe()}
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div style={S.info()}>
          <p>
            <strong style={S.strong()}>Telepon:</strong> (021) 123-4567
          </p>
          <p>
            <strong style={S.strong()}>Email:</strong> beasiswa@palma.go.id
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Kontak;
