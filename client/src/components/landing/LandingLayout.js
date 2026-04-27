import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaFacebook,
  FaInstagram,
  FaMoon,
  FaShoppingBag,
  FaSun,
  FaTimes,
  FaTwitter,
} from "react-icons/fa";
import LOGO from "../../assets/logo.png";
import SignInSidebar from "../SignInSidebar";

const LandingUiContext = createContext({
  openAuth: () => {},
  isDark: false,
  toggleTheme: () => {},
});

export const useLandingUi = () => useContext(LandingUiContext);

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/features" },
  { label: "About", path: "/about" },
  { label: "Partner", path: "/partner" },
  { label: "Contact", path: "/contact" },
];

const LandingLayout = ({ children }) => {
  const [signInSidebarOpen, setSignInSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enableDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDark(enableDark);
    document.documentElement.classList.toggle("dark", enableDark);

    const handleStorage = (e) => {
      if (e.key === "theme") {
        const nextIsDark = e.newValue === "dark";
        setIsDark(nextIsDark);
        document.documentElement.classList.toggle("dark", nextIsDark);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const openAuth = () => setSignInSidebarOpen(true);

  const contextValue = useMemo(
    () => ({ openAuth, isDark, toggleTheme }),
    [isDark]
  );

  return (
    <LandingUiContext.Provider value={contextValue}>
      <div className="min-h-screen bg-app text-app-primary transition-theme">
        <SignInSidebar
          isOpen={signInSidebarOpen}
          onClose={() => setSignInSidebarOpen(false)}
          onSignIn={() => setSignInSidebarOpen(false)}
        />

        <header
          className={`fixed inset-x-0 top-0 z-50 transition-theme ${
            isScrolled ? "landing-glass py-3 shadow-md" : "bg-transparent py-5"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={LOGO}
                alt="QuickBite logo"
                className="h-10 w-10 rounded-xl border border-app-border/60 object-cover transition-transform duration-300 group-hover:rotate-6"
              />
              <span className="font-display text-2xl font-bold tracking-tight text-app-primary">
                Quick<span className="text-brand">Bite</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold transition-colors ${
                      active ? "text-brand" : "text-app-secondary hover:text-brand"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <button
                onClick={toggleTheme}
                className="rounded-full border border-app-border p-2 text-app-secondary transition-colors hover:text-brand"
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>
              <button
                onClick={openAuth}
                className="px-4 py-2 text-sm font-semibold text-app-secondary transition-colors hover:text-brand"
              >
                Login
              </button>
              <button
                onClick={openAuth}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:scale-105 hover:bg-brand-dark"
              >
                Signup
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 text-app-secondary"
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="rounded-full p-2 text-app-primary"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="landing-glass border-t border-app-border/70 px-6 pb-6 pt-4 md:hidden">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-base font-medium text-app-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={openAuth}
                    className="rounded-xl border border-brand/40 py-2.5 font-semibold text-brand"
                  >
                    Login
                  </button>
                  <button
                    onClick={openAuth}
                    className="rounded-xl bg-brand py-2.5 font-semibold text-white"
                  >
                    Signup
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>{children}</main>

        <footer className="border-t border-app-border/50 bg-app-surface pb-10 pt-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-4">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <img
                    src={LOGO}
                    alt="QuickBite logo"
                    className="h-8 w-8 rounded-lg border border-app-border/60"
                  />
                  <span className="font-display text-xl font-bold text-app-primary">
                    Quick<span className="text-brand">Bite</span>
                  </span>
                </div>
                <p className="mb-6 text-sm text-app-secondary">
                  Smarter food discovery, AI-first suggestions, and seamless ordering.
                </p>
                <div className="flex gap-3">
                  {[FaInstagram, FaTwitter, FaFacebook].map((Icon, idx) => (
                    <a
                      href="#"
                      key={idx}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border text-app-secondary transition-colors hover:border-brand hover:bg-brand hover:text-white"
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-5 font-display text-lg font-semibold text-app-primary">Product</h4>
                <ul className="space-y-3 text-sm text-app-secondary">
                  <li><Link to="/" className="hover:text-brand">Home</Link></li>
                  <li><Link to="/features" className="hover:text-brand">Features</Link></li>
                  <li><Link to="/about" className="hover:text-brand">About</Link></li>
                  <li><Link to="/partner" className="hover:text-brand">For Restaurants</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-5 font-display text-lg font-semibold text-app-primary">Support</h4>
                <ul className="space-y-3 text-sm text-app-secondary">
                  <li><Link to="/contact" className="hover:text-brand">Help Center</Link></li>
                  <li><a href="#" className="hover:text-brand">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-brand">Privacy Policy</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-5 font-display text-lg font-semibold text-app-primary">Quick Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={openAuth}
                    className="w-full rounded-xl border border-app-border bg-app px-4 py-3 text-left text-sm font-semibold text-app-primary transition-colors hover:border-brand/40 hover:bg-brand-soft"
                  >
                    Start Ordering
                  </button>
                  <Link
                    to="/partner"
                    className="block w-full rounded-xl bg-brand px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    List Your Restaurant
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-app-border/60 pt-7 text-xs text-app-secondary md:flex-row">
              <p>© 2026 QuickBite. All rights reserved.</p>
              <p>Designed for fast cravings, built for every mood.</p>
            </div>
          </div>
        </footer>
      </div>
    </LandingUiContext.Provider>
  );
};

export default LandingLayout;