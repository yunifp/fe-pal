import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Award,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  Calendar,
  Star,
  Quote,
} from "lucide-react";

const LOther = () => {
  // Data untuk berbagai section
  const features = [
    {
      icon: GraduationCap,
      title: "Beasiswa S1 & S2",
      description:
        "Program beasiswa penuh dengan ikatan dinas di perusahaan terkemuka",
      highlight: "100% Gratis",
    },
    {
      icon: Award,
      title: "Sertifikasi BNSP",
      description:
        "Pelatihan tersertifikasi BNSP yang diakui industri nasional",
      highlight: "Terakreditasi",
    },
    {
      icon: Briefcase,
      title: "Jaminan Penempatan",
      description: "95% lulusan langsung ditempatkan di perusahaan perkebunan",
      highlight: "Karir Terjamin",
    },
    {
      icon: Users,
      title: "Mentoring Intensif",
      description: "Bimbingan langsung dari praktisi senior industri sawit",
      highlight: "Expert Guidance",
    },
  ];

  const programs = [
    {
      title: "Beasiswa Sarjana (S1)",
      duration: "4 Tahun",
      type: "Full Scholarship",
      benefits: [
        "Biaya kuliah 100% ditanggung",
        "Uang saku bulanan",
        "Asrama & makan",
        "Buku & peralatan kuliah",
        "Ikatan dinas 5 tahun",
      ],
      quota: "500 Peserta",
      deadline: "31 Desember 2025",
    },
    {
      title: "Beasiswa Magister (S2)",
      duration: "2 Tahun",
      type: "Full Scholarship",
      benefits: [
        "Biaya kuliah penuh",
        "Tunjangan riset",
        "Publikasi internasional",
        "Konferensi nasional",
        "Ikatan dinas 3 tahun",
      ],
      quota: "100 Peserta",
      deadline: "31 Desember 2025",
    },
    {
      title: "Pelatihan Profesional",
      duration: "3-6 Bulan",
      type: "Certified Training",
      benefits: [
        "Sertifikat BNSP",
        "Pelatihan lapangan",
        "Magang berbayar",
        "Job placement",
        "Networking industri",
      ],
      quota: "1000 Peserta",
      deadline: "Rolling Admission",
    },
  ];

  const partners = [
    "PT Astra Agro Lestari",
    "PT Perkebunan Nusantara",
    "Wilmar International",
    "Sinar Mas Agro",
    "Golden Agri-Resources",
    "Musim Mas Group",
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Assistant Manager - PT Astra Agro",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
      text: "Program beasiswa PALMA mengubah hidup saya. Dari lulusan SMA biasa, sekarang saya sudah menjadi Assistant Manager dengan gaji yang tidak pernah saya bayangkan.",
      year: "Alumni 2020",
    },
    {
      name: "Siti Nurhaliza",
      role: "Agronomist - Wilmar International",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
      text: "Pelatihan di PALMA sangat aplikatif. Semua yang dipelajari langsung bisa diterapkan di lapangan. Mentornya juga sangat supportive dan berpengalaman.",
      year: "Alumni 2021",
    },
    {
      name: "Ahmad Rizki",
      role: "Plantation Supervisor - Sinar Mas",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
      text: "Saya sangat bersyukur bisa mengikuti program S2. Sekarang saya bisa berkontribusi lebih dalam pengembangan perkebunan berkelanjutan di Indonesia.",
      year: "Alumni 2019",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Daftar Online",
      description: "Isi formulir pendaftaran dan upload dokumen persyaratan",
    },
    {
      step: "2",
      title: "Seleksi Administrasi",
      description: "Tim kami akan verifikasi kelengkapan dokumen Anda",
    },
    {
      step: "3",
      title: "Tes & Wawancara",
      description: "Ikuti tes tertulis dan wawancara dengan panel ahli",
    },
    {
      step: "4",
      title: "Pengumuman",
      description: "Pengumuman hasil seleksi dan onboarding program",
    },
  ];

  return (
    <div className="w-full">
      {/* SECTION: Why Choose PALMA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Mengapa Memilih PALMA?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Platform Terlengkap untuk
              <span className="text-green-600"> Karir Sawit</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan ekosistem lengkap untuk pengembangan SDM
              berkualitas di industri kelapa sawit Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="mb-3 bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    {feature.highlight}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: Programs */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-600 text-white">
              Program Unggulan
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pilih Program yang Sesuai
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami menawarkan berbagai program untuk semua level, dari fresh
              graduate hingga profesional berpengalaman
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 transition-all overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <Badge className="mb-3 bg-yellow-400 text-gray-900">
                    {program.type}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{program.title}</h3>
                  <p className="text-green-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {program.duration}
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {program.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kuota Tersedia</span>
                      <span className="font-semibold text-gray-900">
                        {program.quota}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deadline</span>
                      <span className="font-semibold text-red-600">
                        {program.deadline}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-lg transition-all">
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Proses Pendaftaran
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cara Bergabung dengan PALMA
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Proses pendaftaran yang mudah dan transparan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div
              className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-500 to-green-200"
              style={{ width: "85%", left: "7.5%" }}
            />

            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8"
            >
              Mulai Pendaftaran
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION: Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-700 border-yellow-200">
              Testimoni Alumni
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kisah Sukses Alumni PALMA
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dengarkan langsung dari mereka yang telah merasakan manfaat PALMA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all relative"
              >
                <Quote className="w-12 h-12 text-green-200 absolute top-6 right-6" />

                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-green-500"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <Badge className="mt-1 text-xs bg-green-100 text-green-700">
                      {testimonial.year}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  "{testimonial.text}"
                </p>

                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Partners */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-200">
              Partner Industri
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dipercaya oleh Perusahaan Terkemuka
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lebih dari 50+ perusahaan perkebunan terkemuka menjadi mitra PALMA
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group"
              >
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-400 group-hover:text-green-600 transition-colors mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-medium">{partner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Siap Memulai Karir Impianmu?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan profesional yang telah mengubah hidup
            mereka melalui PALMA. Kesempatanmu menanti!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-all"
            >
              Daftar Beasiswa Sekarang
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold text-lg px-8 py-6"
            >
              Konsultasi Gratis
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Gratis Pendaftaran</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Proses Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>100% Transparan</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LOther;
