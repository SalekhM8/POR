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
          <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-full p-3 shadow-lg opacity-80 group-hover:opacity-100 group-hover:bg-white/12 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/90">
              <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/>
            </svg>
          </div>
        </Link>
        {/* Mobile hamburger on the right */}
        <div className="md:hidden fixed top-4 right-4 z-[60]">
          <div className="relative">
            <button aria-label="Open menu" className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-full p-2.5 shadow-lg hover:bg-white/12 transition-all" onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/90">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/>
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl fade-in">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className={`nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all ${pathname === l.href ? "opacity-100 bg-white/10" : "opacity-85"}`} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))}
                {/* Services & Photos submenu for mobile */}
                <div className="mt-1 border-t border-white/10 pt-1">
                  <Link href="/treatments" className="nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 opacity-85 transition-all" onClick={() => setOpen(false)}>Treatments</Link>
                  <Link href="/training" className="nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 opacity-85 transition-all" onClick={() => setOpen(false)}>Personal Training</Link>
                  <Link href={"/photos" as Route} className="nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 opacity-85 transition-all" onClick={() => setOpen(false)}>Photos</Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="hidden md:flex backdrop-blur-xl bg-white/5 border border-white/10 rounded-full shadow-2xl items-center justify-center gap-6 md:gap-10 w-[min(90vw,900px)] px-8 md:px-12 py-3">
          <Link href="/story" className={`nav-link px-1 ${pathname === "/story" ? "opacity-100" : "opacity-80"}`}>My story</Link>
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
            <button type="button" className={`nav-link px-1 ${pathname.startsWith('/treatments') || pathname.startsWith('/training') ? 'opacity-100':'opacity-80'}`}>Services</button>
            {servicesOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 min-w-56 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl fade-in">
                <Link href="/treatments" className="nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all">Treatments</Link>
                <Link href="/training" className="nav-link block px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all">Personal Training</Link>
              </div>
            )}
          </div>
          <Link href="/cases" className={`nav-link px-1 ${pathname === "/cases" ? "opacity-100" : "opacity-80"}`}>Case studies</Link>
          <Link href={"/photos" as Route} className={`nav-link px-1 ${pathname === "/photos" ? "opacity-100" : "opacity-80"}`}>Photos</Link>
          <Link href="/contact" className={`nav-link px-1 ${pathname === "/contact" ? "opacity-100" : "opacity-80"}`}>Contact us</Link>
        </nav>
      </div>
    </div>
  );
}


