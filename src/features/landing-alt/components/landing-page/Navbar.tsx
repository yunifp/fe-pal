import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Menu, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDaftar = () => {
    navigate("/daftar-instansi");
    setIsMobileMenuOpen(false);
  };

  const handleMasuk = () => {
    navigate("/login-instansi");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/images/Ditjenbun.png"
              alt="BPDP Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Menu */}
            <div className="flex items-center space-x-8">
              <a href="/#beranda">Beranda</a>
              <a href="/#dashboard">Dashboard</a>
              {/* <a href="#kontak" className="nav-link">
                Kontak
              </a> */}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => navigate("/login-instansi")}
                className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Masuk
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary transition-colors duration-200"
              aria-label="Toggle menu">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}>
        <div className="px-4 pt-2 pb-4 space-y-3 bg-white border-t border-gray-100">
          {/* Navigation Links */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium">
            Beranda
          </Link>
          <a
            href="#dashboard"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium">
            Dashboard
          </a>
          {/* <Link
            to="/pendaftaran-beasiswa"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Beasiswa
          </Link> */}
          {/* <a
            href="#kontak"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Kontak
          </a> */}

          {/* Auth Buttons - Mobile */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Button
              onClick={handleDaftar}
              variant="outline"
              className="w-full border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              Daftar
            </Button>

            <Button
              onClick={handleMasuk}
              className="w-full flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Masuks
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
