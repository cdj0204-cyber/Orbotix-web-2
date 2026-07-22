"use client";

import Link from "next/link";

const links = {
  Technology: [
    { label: "VASPYR-2", href: "/wasper-2" },
    { label: "VYGIL-1", href: "/vigil-1" },
  ],
  Solution: [
    { label: "Defense", href: "#" },
    { label: "Security", href: "#" },
  ],
  Company: [
    { label: "Mission", href: "#mission" },
    { label: "Leadership", href: "#leadership" },
    { label: "Careers", href: "#" },
  ],
  Insight: [
    { label: "Newsroom", href: "#newsroom" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Export Controls", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const socials = [
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

function scrollTo(href: string) {
  if (href === "#") return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="relative bg-black pt-16 pb-8">
      <div className="px-4 sm:px-10">
        {/* 카드 섹션과 동일한 2단 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-14">
          {/* 왼쪽: 브랜드 */}
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="block mb-6"
            >
              <span className="text-white text-[15px] font-medium uppercase tracking-normal leading-tight">
                Orbotix Industries
              </span>
            </button>
            <div className="flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="text-white hover:text-white/60 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 오른쪽: 링크 그룹 (Products / Systems / Company / Legal) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <p className="text-white text-[15px] font-medium uppercase tracking-normal leading-tight mb-3">
                  {group}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.label}>
                      {item.href.startsWith("/") ? (
                        <Link
                          href={item.href}
                          className="text-white text-[15px] font-medium uppercase tracking-normal leading-tight hover:opacity-60 transition-opacity"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={() => scrollTo(item.href)}
                          className="text-white text-[15px] font-medium uppercase tracking-normal leading-tight hover:opacity-60 transition-opacity"
                        >
                          {item.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white/20 text-[9px] tracking-[0.25em] uppercase font-mono">
            © 2026 ORBOTIX INDUSTRIES. ALL RIGHTS RESERVED.
          </span>
          <span className="text-white/10 text-[9px] tracking-[0.3em] font-mono uppercase">
            UNCLASSIFIED // FOR OFFICIAL USE ONLY
          </span>
        </div>
      </div>
    </footer>
  );
}
