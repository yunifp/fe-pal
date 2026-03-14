import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Submenu {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href?: string;
  submenu?: Submenu[];
}

const LNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: MenuItem[] = [
    { label: "Beranda", href: "/" },
    {
      label: "Tentang",
      submenu: [
        { label: "Penjelasan", href: "/tentang/penjelasan" },
        { label: "Kontak", href: "/tentang/kontak" },
      ],
    },
    {
      label: "Beasiswa",
      submenu: [
        { label: "Alur Pendaftaran", href: "/beasiswa/alur" },
        { label: "Program Studi", href: "/beasiswa/program-studi" },
        { label: "Persyaratan", href: "/beasiswa/persyaratan" },
      ],
    },
    { label: "Pengumuman", href: "/auth/register" },
    { label: "Daftar", href: "/auth/register" },
    { label: "Login", href: "/login" },
  ];

  const toggleSubmenu = (label: string): void => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-yellow-400 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? "bg-yellow-500" : "bg-white/10"
              }`}
            >
              <img
                src="/images/logo.png"
                alt="KPU Logo"
                className="h-12 w-auto"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = "block";
                  }
                }}
              />
              <div
                className="h-8 w-8 bg-white rounded flex items-center justify-center font-bold text-yellow-600"
                style={{ display: "none" }}
              >
                K
              </div>
            </div>
            <div>
              <h1
                className={`text-lg font-bold transition-colors ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
              >
                PALMA
              </h1>

              <p
                className={`text-sm transition-colors ${
                  isScrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                Platform SDM Perkebunan Kelapa Sawit
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.submenu ? (
                      <>
                        <NavigationMenuTrigger
                          className={`font-medium transition-colors ${
                            isScrolled
                              ? "text-gray-900 hover:bg-yellow-500 data-[state=open]:bg-yellow-500"
                              : "text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                          } bg-transparent`}
                        >
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-48 gap-1 p-2">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.label}>
                                <NavigationMenuLink asChild>
                                  <a
                                    href={subitem.href}
                                    className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-yellow-50 hover:text-yellow-600 focus:bg-yellow-50"
                                  >
                                    {subitem.label}
                                  </a>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <a
                          href={item.href}
                          className={`px-4 py-2 font-medium transition-colors rounded-lg inline-block ${
                            isScrolled
                              ? "text-gray-900 hover:bg-yellow-500"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </a>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isScrolled
                      ? "text-gray-900 hover:bg-yellow-500"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <div key={item.label}>
                      {item.submenu ? (
                        <Collapsible
                          open={openSubmenu === item.label}
                          onOpenChange={() => toggleSubmenu(item.label)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between font-medium"
                            >
                              {item.label}
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  openSubmenu === item.label ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4 mt-2 space-y-2">
                            {item.submenu.map((subitem) => (
                              <a
                                key={subitem.label}
                                href={subitem.href}
                                className="block py-2 px-4 text-sm text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subitem.label}
                              </a>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full justify-start font-medium"
                          asChild
                        >
                          <a
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LNavbar;
