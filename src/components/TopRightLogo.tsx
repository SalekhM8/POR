"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function TopRightLogo() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  return (
    <Link href="/" aria-label="Home" className="fixed top-3 left-3 z-[60] md:top-4 md:left-4">
      <Image
        src="/POR-removebg-preview.png"
        alt="Path of Refinement"
        width={96}
        height={96}
        priority
        className="w-16 h-16 md:w-28 md:h-28 object-contain drop-shadow"
      />
    </Link>
  );
}


