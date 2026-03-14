export default function LFooter() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌴</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">PALMA</h3>
                <p className="text-sm text-gray-400">
                  Platform SDM Perkebunan Kelapa Sawit
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Aplikasi Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit,
              Membangun SDM Unggul untuk Perkebunan Kelapa Sawit Indonesia
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Beasiswa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Pengumuman
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 PALMA - BPDPKS. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
