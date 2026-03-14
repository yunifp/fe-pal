import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function TentangKontakPage() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    subjek: "",
    pesan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Pesan Anda telah dikirim!");
      setFormData({ nama: "", email: "", subjek: "", pesan: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              Platform Resmi BPDPKS
            </div>
            <h1 className="text-5xl font-bold mb-4">Hubungi Kami</h1>
            <p className="text-xl text-green-50 max-w-2xl mx-auto">
              Tim kami siap membantu Anda dengan pertanyaan seputar beasiswa
              perkebunan kelapa sawit
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Cards */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Alamat Kantor
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Jl. Medan Merdeka Timur No. 1<br />
              Jakarta Pusat 10110
              <br />
              Indonesia
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Telepon</h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Layanan Informasi:</span>
              <br />
              +62 21 1234 5678
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">WhatsApp:</span>
              <br />
              +62 812 3456 7890
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Email</h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Informasi Umum:</span>
              <br />
              info@palma.bpdpks.id
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Beasiswa:</span>
              <br />
              beasiswa@palma.bpdpks.id
            </p>
          </div>
        </div>

        {/* Contact Form & Info */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Kirim Pesan
            </h2>
            <p className="text-gray-600 mb-8">
              Isi formulir di bawah ini dan tim kami akan merespons dalam 1x24
              jam
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  name="subjek"
                  value={formData.subjek}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Perihal pesan Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pesan
                </label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl shadow-lg p-8 text-white">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Jam Operasional</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-green-400/30 pb-3">
                  <span className="font-semibold">Senin - Jumat</span>
                  <span>08.00 - 17.00 WIB</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-400/30 pb-3">
                  <span className="font-semibold">Sabtu</span>
                  <span>08.00 - 12.00 WIB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Minggu & Libur</span>
                  <span>Tutup</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                FAQ Cepat
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Bagaimana cara mendaftar beasiswa?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Kunjungi halaman Daftar Beasiswa pada menu utama
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Kapan pengumuman hasil?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cek halaman Pengumuman secara berkala
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Dokumen apa saja yang diperlukan?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lihat panduan lengkap di halaman Beasiswa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
