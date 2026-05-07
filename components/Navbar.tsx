"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type DropdownItem = { label: string; href: string };
type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; dropdown: DropdownItem[]; href?: never };

const navItems: NavItem[] = [
  {
    label: "WASPER-1",
    href: "#wasper-1",
  },
  {
    label: "VMBRA System",
    dropdown: [
      { label: "Overview", href: "#vmbra-system" },
      { label: "VIGIL-1", href: "#vigil-1" },
    ],
  },
  {
    label: "ABOUT US",
    dropdown: [
      { label: "Mission", href: "#mission" },
      { label: "Leadership", href: "#leadership" },
      { label: "Newsroom", href: "#newsroom" },
    ],
  },
];

function scrollTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function DropdownMenu({ items }: { items: DropdownItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-0 mt-2 min-w-[160px] bg-black border border-white/20 py-1 z-50"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => scrollTo(item.href)}
          className="w-full text-left px-5 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors tracking-widest uppercase font-medium"
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

function NavDropdown({ item }: { item: NavItem & { dropdown: DropdownItem[] } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-semibold text-white/70 hover:text-white transition-colors py-1"
      >
        {item.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>{open && <DropdownMenu items={item.dropdown} />}</AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center"
        >
          <Image
            src="/image/Orbotix_Logo_Icon_W.png"
            alt="Orbotix"
            width={90}
            height={30}
            className="object-contain"
            priority
          />
        </button>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) =>
            item.dropdown ? (
              <NavDropdown key={item.label} item={item as NavItem & { dropdown: DropdownItem[] }} />
            ) : (
              <button
                key={item.label}
                onClick={() => item.href && scrollTo(item.href)}
                className="text-xs tracking-widest uppercase font-semibold text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => scrollTo("#contact-cta")}
          className="hidden md:block px-5 py-2 border border-white text-white text-xs tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-200"
        >
          Contact us
        </button>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-white origin-center"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-0.5 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-white origin-center"
          />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-black"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      item.dropdown
                        ? setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                        : (scrollTo(item.href!), setMobileOpen(false))
                    }
                    className="w-full flex items-center justify-between py-3 text-sm tracking-widest uppercase font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                    {item.dropdown && (
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                        className={`transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}>
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <AnimatePresence>
                    {item.dropdown && mobileExpanded === item.label && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        {item.dropdown.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => { scrollTo(sub.href); setMobileOpen(false); }}
                            className="block w-full text-left pl-4 py-2.5 text-sm text-white/50 hover:text-white tracking-widest uppercase transition-colors"
                          >
                            {sub.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <button
                onClick={() => { scrollTo("#contact-cta"); setMobileOpen(false); }}
                className="mt-3 w-full py-3 border border-white text-white text-xs tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all"
              >
                Contact us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
