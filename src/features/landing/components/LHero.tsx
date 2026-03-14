import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Award, TrendingUp, ArrowRight } from "lucide-react";

const LHero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { icon: Users, value: "10,000+", label: "Peserta Aktif" },
    { icon: Award, value: "50+", label: "Perusahaan Partner" },
    { icon: TrendingUp, value: "95%", label: "Tingkat Penempatan" },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 pt-[300px] xl:pt-0">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero Background Image with Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100"
        style={{
          backgroundImage: "url('/images/sawit.jpg')",
          transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"
          style={{
            transform: `translateY(${-scrollY * 0.2}px)`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Platform Resmi BPDPKS
            </Badge>
          </div>

          {/* Main Headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              transform: `translateY(${-scrollY * 0.1}px)`,
            }}>
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              PALMA
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-6"
            style={{
              transform: `translateY(${-scrollY * 0.15}px)`,
            }}>
            Platform SDM Perkebunan Kelapa Sawit
          </p>

          {/* Subheadline */}
          {/* <h2
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{
              transform: `translateY(${-scrollY * 0.2}px)`,
            }}
          >
            Wujudkan Karir Impian di
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Industri Kelapa Sawit
            </span>
          </h2> */}

          {/* Description */}
          <p
            className="text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed"
            style={{
              transform: `translateY(${-scrollY * 0.25}px)`,
            }}>
            Aplikasi Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit,
            Membangun SDM Unggul untuk Perkebunan Kelapa Sawit Indonesia
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            style={{
              transform: `translateY(${-scrollY * 0.3}px)`,
            }}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold text-lg px-8 py-6 shadow-2xl shadow-yellow-500/30 hover:scale-105 hover:shadow-yellow-500/50 group">
              Daftar Beasiswa
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 font-semibold text-lg px-8 py-6 hover:scale-105">
              Calon Penerima Beasiswa Yang Lulus
            </Button>
          </div>

          {/* Stats Section */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            style={{
              transform: `translateY(${-scrollY * 0.35}px)`,
            }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 hover:border-yellow-500/50">
                  <Icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LHero;
