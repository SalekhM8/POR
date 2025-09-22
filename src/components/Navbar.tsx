"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../public/POR-removebg-preview.png";

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: "/story", label: "My story" },
    { href: "/treatments", label: "Treatments" },
    { href: "/cases", label: "Case studies" },
    { href: "/contact", label: "Contact us" },
  ];
  return (
    <div className="fixed left-0 right-0 z-50 top-4 md:top-6">
      <div className="relative flex flex-col items-center px-6 py-4 gap-3">
        {/* Row with centered nav; desktop logo sits absolute on the left */}
        <div className="relative w-full flex items-center justify-center">
          <Link href="/" className="hidden md:inline-flex absolute left-6 top-1/2 -translate-y-1/2">
            <Image src={logo} alt="Path of Refinement" className="h-20 md:h-24 w-auto select-none object-contain" priority />
          </Link>
          <nav className="flex items-center gap-8 bg-black/20 rounded-full px-6 py-2 backdrop-blur border border-white/10">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${pathname === l.href ? "opacity-100" : "opacity-80"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Mobile: show centered logo under the nav */}
        <Link href="/" className="md:hidden inline-flex items-center justify-center">
          <Image src={logo} alt="Path of Refinement" className="h-20 w-auto select-none object-contain" priority />
        </Link>
      </div>
    </div>
  );
}


