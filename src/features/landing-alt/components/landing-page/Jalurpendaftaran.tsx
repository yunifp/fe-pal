import { useState } from "react";
import JalurModal from "./Jalurmodal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JalurDetail {
  id: number;
  title: string;
  img: string;
  deskripsi: string;
  syarat: string[];
  dokumen: string[];
  kuota: number;
  jenjang: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const jalurData: JalurDetail[] = [
  {
    id: 1,
    title: "Pekebun dan Keluarga Pekebun",
    img: "/images/landing/2.png",
    deskripsi:
      "Program beasiswa ini diperuntukkan bagi pekebun kelapa sawit atau keluarga pekebun yang memenuhi persyaratan administrasi dan akademik yang telah ditetapkan.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Usia maksimal 23 tahun",
      "Tidak sedang menempuh perkuliahan",
      "Bersedia mengelola kelembagaan pekebun atau bekerja pada industri perkelapasawitan setelah lulus",
      "Mendapat izin dari orang tua/wali atau suami/istri",
      "Lulus seleksi administrasi dan akademik",
    ],

    dokumen: [
      "Pas foto 4x6 latar belakang biru dengan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah/SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Legalitas lahan (sertifikat hak milik, SKT, sporadik, girik, AJB, atau STD-B)",
      "Surat keterangan dari kepala desa jika sertifikat berbeda dengan identitas pekebun",
      "Surat pernyataan sebagai pekebun bermaterai",
      "Surat pernyataan tidak sedang menerima beasiswa lain",
      "Surat pernyataan bersedia mengikuti ketentuan program",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 500,
    jenjang: ["D3", "D4", "S1"],
    // jenjang: [],
  },
  {
    id: 2,
    title: "Karyawan/Pekerja pada Usaha Perkebunan Kelapa Sawit",
    img: "/images/landing/5.png",
    deskripsi:
      "Program ini diperuntukkan bagi karyawan atau pekerja pada usaha perkebunan kelapa sawit yang ingin meningkatkan kompetensi dan pendidikan melalui program beasiswa pendidikan tinggi.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Usia maksimal 23 tahun",
      "Tidak sedang menempuh perkuliahan",
      "Bersedia bekerja atau berkontribusi pada industri perkelapasawitan setelah menyelesaikan pendidikan",
      "Mendapat izin dari orang tua/wali atau suami/istri",
      "Lulus seleksi administrasi dan akademik",
      "Bekerja pada usaha perkebunan kelapa sawit minimal 2 tahun",
    ],

    dokumen: [
      "Pas foto 4x6 dengan latar belakang biru dan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah atau SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Surat keterangan bekerja minimal 2 tahun dari pemilik usaha/pimpinan unit",
      "Surat izin atau tugas belajar dari perusahaan bagi karyawan tetap",
      "Surat keterangan bekerja yang diketahui kepala desa untuk pekerja harian/borongan",
      "Surat pernyataan izin mengikuti pendidikan dari orang tua/wali atau suami/istri",
      "Surat pernyataan tidak sedang menempuh perkuliahan",
      "Surat pernyataan bersedia bekerja atau berkontribusi di industri perkelapasawitan setelah lulus",
      "Surat pernyataan tidak mengundurkan diri setelah dinyatakan diterima",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 300,
    jenjang: ["D3", "D4", "S1", "S2"],
  },
  {
    id: 3,
    title: "Keluarga Karyawan/Pekerja pada Usaha Perkebunan Kelapa Sawit",
    img: "/images/landing/6.png",
    deskripsi:
      "Program ini diperuntukkan bagi anak atau pasangan dari karyawan/pekerja pada usaha perkebunan kelapa sawit untuk memperoleh kesempatan melanjutkan pendidikan tinggi melalui program beasiswa.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Merupakan anak atau pasangan sah dari karyawan/pekerja pada usaha perkebunan kelapa sawit",
      "Usia maksimal 23 tahun (per 16 Juni 2025)",
      "Tidak sedang menempuh perkuliahan",
      "Bersedia bekerja atau berkontribusi pada industri perkelapasawitan setelah menyelesaikan pendidikan",
      "Mendapat izin dari orang tua/wali atau suami/istri",
      "Lulus seleksi administrasi dan akademik",
    ],

    dokumen: [
      "Pas foto 4x6 dengan latar belakang biru dan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah atau SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Surat keterangan bekerja minimal 2 tahun dari pemilik usaha/pimpinan unit bagi orang tua/suami/istri",
      "Surat keterangan bekerja yang diketahui kepala desa untuk pekerja harian/borongan",
      "Surat pernyataan izin mengikuti pendidikan dari orang tua/wali atau suami/istri",
      "Surat pernyataan tidak sedang menempuh perkuliahan",
      "Surat pernyataan bersedia bekerja atau berkontribusi di industri perkelapasawitan setelah lulus",
      "Surat pernyataan tidak mengundurkan diri setelah dinyatakan diterima",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 250,
    jenjang: ["D3", "D4", "S1"],
  },
  {
    id: 4,
    title: "Pengurus Kelembagaan Pekebun Kelapa Sawit",
    img: "/images/landing/7.png",
    deskripsi:
      "Program ini ditujukan bagi pengurus aktif kelembagaan pekebun kelapa sawit seperti koperasi, kelompok tani, atau organisasi pekebun lainnya untuk meningkatkan kapasitas sumber daya manusia melalui pendidikan tinggi.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Merupakan pengurus aktif kelembagaan pekebun kelapa sawit",
      "Usia maksimal 23 tahun (per 16 Juni 2025)",
      "Tidak sedang menempuh perkuliahan",
      "Telah menjabat sebagai pengurus kelembagaan pekebun minimal 2 tahun",
      "Bersedia bekerja atau berkontribusi pada industri perkelapasawitan setelah menyelesaikan pendidikan",
      "Mendapat izin dari orang tua/wali atau suami/istri",
      "Lulus seleksi administrasi dan akademik",
    ],

    dokumen: [
      "Pas foto 4x6 dengan latar belakang biru dan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah atau SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Surat keputusan atau dokumen legalitas sebagai pengurus kelembagaan pekebun yang telah menjabat minimal 2 tahun",
      "Surat pernyataan izin mengikuti pendidikan dari orang tua/wali atau suami/istri",
      "Surat pernyataan tidak sedang menempuh perkuliahan",
      "Surat pernyataan bersedia bekerja atau berkontribusi di industri perkelapasawitan setelah lulus",
      "Surat pernyataan tidak mengundurkan diri setelah dinyatakan diterima",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 150,
    jenjang: ["D4", "S1", "S2"],
  },
  {
    id: 5,
    title: "Pengurus Asosiasi Pekebun Kelapa Sawit",
    img: "/images/landing/1.png",
    deskripsi:
      "Program ini diperuntukkan bagi pengurus aktif asosiasi pekebun kelapa sawit di tingkat daerah maupun nasional untuk meningkatkan kapasitas sumber daya manusia melalui pendidikan tinggi.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Merupakan pengurus aktif asosiasi pekebun kelapa sawit",
      "Usia maksimal 23 tahun (per 16 Juni 2025)",
      "Tidak sedang menempuh perkuliahan",
      "Telah menjabat sebagai pengurus asosiasi minimal 2 tahun",
      "Bersedia bekerja atau berkontribusi pada industri perkelapasawitan setelah menyelesaikan pendidikan",
      "Mendapat izin dari orang tua/wali atau suami/istri",
      "Lulus seleksi administrasi dan akademik",
    ],

    dokumen: [
      "Pas foto 4x6 dengan latar belakang biru dan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah atau SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Surat keputusan atau dokumen legalitas sebagai pengurus asosiasi pekebun kelapa sawit yang telah menjabat minimal 2 tahun",
      "Surat pernyataan izin mengikuti pendidikan dari orang tua/wali atau suami/istri",
      "Surat pernyataan tidak sedang menempuh perkuliahan",
      "Surat pernyataan bersedia bekerja atau berkontribusi di industri perkelapasawitan setelah lulus",
      "Surat pernyataan tidak mengundurkan diri setelah dinyatakan diterima",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 100,
    jenjang: ["S1", "S2"],
  },
  {
    id: 6,
    title:
      "Aparatur Sipil Negara (ASN) yang bertugas di bidang perkelapasawitan",
    img: "/images/landing/4.png",
    deskripsi:
      "Program ini diperuntukkan bagi Aparatur Sipil Negara (ASN) yang bertugas pada unit kerja yang berkaitan dengan pengelolaan, pembinaan, atau pengawasan sektor perkebunan kelapa sawit untuk meningkatkan kompetensi melalui pendidikan tinggi.",

    syarat: [
      "Warga Negara Indonesia (WNI)",
      "Berstatus sebagai ASN aktif (PNS/PPPK)",
      "Bertugas pada unit kerja yang membidangi sektor perkebunan kelapa sawit",
      "Usia maksimal 23 tahun (per 16 Juni 2025)",
      "Tidak sedang menempuh perkuliahan",
      "Mendapat izin atau penugasan belajar dari pejabat yang berwenang",
      "Bersedia kembali bertugas di bidang perkebunan kelapa sawit setelah menyelesaikan pendidikan",
      "Lulus seleksi administrasi dan akademik",
    ],

    dokumen: [
      "Pas foto 4x6 dengan latar belakang biru dan pakaian formal",
      "KTP atau surat keterangan domisili",
      "Kartu Keluarga (KK)",
      "Akta kelahiran atau surat keterangan lahir",
      "Surat keterangan sehat dari dokter",
      "Surat keterangan tes buta warna dari dokter",
      "Ijazah atau SKL dan rapor semester 1–5 dengan nilai rata-rata minimal 7 (atau 6 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Ijazah dan transkrip nilai dengan IPK minimal 2.75 (atau 2.50 untuk wilayah Papua, NTT, dan daerah 3T)",
      "Keputusan pengangkatan sebagai Aparatur Sipil Negara (ASN)",
      "Surat penugasan pada unit kerja yang membidangi perkebunan kelapa sawit",
      "Keputusan tugas belajar dari Pejabat Pembina Kepegawaian",
      "Surat komitmen dari pejabat bidang SDM untuk penugasan kembali setelah lulus",
      "Surat pernyataan izin mengikuti pendidikan dari orang tua/wali atau suami/istri",
      "Surat pernyataan tidak sedang menempuh perkuliahan",
      "Surat pernyataan bersedia bekerja atau berkontribusi di industri perkelapasawitan setelah lulus",
      "Surat pernyataan tidak mengundurkan diri setelah dinyatakan diterima",
      "Surat keterangan tidak mampu dari kepala desa (jika diperlukan)",
    ],

    kuota: 200,
    jenjang: ["S1", "S2", "S3"],
  },
];

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
    flex: "wrap",
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
};

// ─── Component ────────────────────────────────────────────────────────────────

const JalurPendaftaran = () => {
  const [activeJalur, setActiveJalur] = useState<JalurDetail | null>(null);

  return (
    <>
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
          <div style={S.grid()}>
            {jalurData.map((jalur) => (
              <div key={jalur.id} style={S.card()}>
                <div style={S.cardImg()}>
                  <img
                    src={jalur.img}
                    alt={jalur.title}
                    style={S.cardImgEl()}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <p style={S.cardTitle()}>{jalur.title}</p>
                <button
                  style={S.cardLink()}
                  onClick={() => setActiveJalur(jalur)}>
                  SELENGKAPNYA
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeJalur && (
        <JalurModal jalur={activeJalur} onClose={() => setActiveJalur(null)} />
      )}
    </>
  );
};

export default JalurPendaftaran;
