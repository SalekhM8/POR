"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import type { Route } from "next";

export default function Navbar() {
  const pathname = usePathname();
  const links: { href: Route; label: string }[] = [
    { href: "/story", label: "My story" },
    { href: "/cases", label: "Case studies" },
    { href: "/contact", label: "Contact us" },
  ];
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (pathname.startsWith("/admin")) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-auto flex justify-center px-3 py-1.5 md:py-3">
        <Link href="/admin" aria-label="Admin" className="fixed bottom-4 right-4 z-[70] group">
          <div className="backdrop-blur bg-white/10 border border-white/15 rounded-full p-3 shadow-md opacity-80 group-hover:opacity-100 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/90">
              <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/>
            </svg>
          </div>
        </Link>
        {/* Mobile hamburger on the right */}
        <div className="md:hidden fixed top-4 right-4 z-[60]">
          <div className="relative">
            <button aria-label="Open menu" className="backdrop-blur bg-white/10 border border-white/15 rounded-full p-2.5 shadow-md" onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/90">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/>
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-52 backdrop-blur bg-black/70 border border-white/15 rounded-xl p-2 shadow-lg">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className={`nav-link heading-serif block px-3 py-2 text-base interactive ${pathname === l.href ? "opacity-100" : "opacity-80"}`} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))}
                {/* Services submenu for mobile */}
                <div className="mt-1 border-t border-white/10 pt-1">
                  <Link href="/treatments" className="nav-link heading-serif block px-3 py-2 text-base interactive opacity-80" onClick={() => setOpen(false)}>Treatments</Link>
                  <Link href="/training" className="nav-link heading-serif block px-3 py-2 text-base interactive opacity-80" onClick={() => setOpen(false)}>Personal Training</Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="hidden md:flex backdrop-blur bg-white/10 border border-white/15 rounded-full shadow-md items-center justify-center gap-6 md:gap-16 w-[min(90vw,920px)] px-6 md:px-10 py-2">
          <Link href="/story" className={`nav-link text-sm md:text-base px-1 ${pathname === "/story" ? "opacity-100" : "opacity-80"}`}>My story</Link>
          {/* Desktop Services dropdown - stateful so the menu doesn't disappear when moving cursor */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              setServicesOpen(true);
            }}
            onMouseLeave={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
            }}
          >
            <button type="button" className={`nav-link text-sm md:text-base px-1 ${pathname.startsWith('/treatments') || pathname.startsWith('/training') ? 'opacity-100':'opacity-80'}`}>Services</button>
            {servicesOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 min-w-56 backdrop-blur bg-black/70 border border-white/15 rounded-xl p-2 shadow-lg">
                <Link href="/treatments" className="nav-link block px-3 py-2">Treatments</Link>
                <Link href="/training" className="nav-link block px-3 py-2">Personal Training</Link>
              </div>
            )}
          </div>
          <Link href="/cases" className={`nav-link text-sm md:text-base px-1 ${pathname === "/cases" ? "opacity-100" : "opacity-80"}`}>Case studies</Link>
          <Link href="/contact" className={`nav-link text-sm md:text-base px-1 ${pathname === "/contact" ? "opacity-100" : "opacity-80"}`}>Contact us</Link>
        </nav>
      </div>
    </div>
  );
}


