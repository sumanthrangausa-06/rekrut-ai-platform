import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { RippleButton } from "@/components/ui/RippleButton";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Who It's For", href: "#who-its-for" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Join Early", href: "#waitlist" },
  { label: "Sign Up", href: "/signup" },
  { label: "Login", href: "/Login"},
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Only consider in-page hash sections
      const sections = navLinks
        .filter((link) => link.href.startsWith("#"))
        .map((link) => link.href.slice(1));

      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    //  Prevent "/signup" from ever being passed to querySelector
    if (!href.startsWith("#")) {
      setIsOpen(false);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b-2 border-foreground shadow-sm"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`font-bold tracking-tight transition-all duration-300 hover:scale-105 ${
              isScrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"
            }`}
          >
            Rekrut AI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    activeSection === link.href.slice(1)
                      ? "text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-foreground transition-all duration-300 ${
                      activeSection === link.href.slice(1) ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative text-sm font-medium transition-colors py-1 text-foreground/60 hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}

            <RippleButton
              onClick={() => scrollToSection("#waitlist")}
              className="shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Join Waitlist
            </RippleButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-2 border-foreground hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 border-t-2 border-foreground" : "max-h-0"
          }`}
        >
          <div className="flex flex-col py-4 gap-2 bg-background">
            {navLinks.map((link, index) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-3 text-left font-medium hover:bg-secondary transition-all"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.3s ease-out ${index * 50}ms, transform 0.3s ease-out ${index * 50}ms`,
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-left font-medium hover:bg-secondary transition-all block"
                  onClick={() => setIsOpen(false)}
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.3s ease-out ${index * 50}ms, transform 0.3s ease-out ${index * 50}ms`,
                  }}
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="px-4 pt-2">
              <RippleButton
                onClick={() => scrollToSection("#waitlist")}
                className="w-full shadow-sm"
              >
                Join Waitlist
              </RippleButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}