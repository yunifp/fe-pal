// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  footer: (): React.CSSProperties => ({
    background: "#2e7d32",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    padding: "28px 24px",
    fontSize: "0.85rem",
    lineHeight: 1.9,
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer style={S.footer()}>
    <p></p>
    <p></p>
    <p>© 2025. Official Website Beasiswa SDM Sawit</p>
  </footer>
);

export default Footer;
