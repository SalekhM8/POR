"use client";
import { usePathname } from "next/navigation";

export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const phone = "+447541499374"; // ensure E.164
  const href = `https://wa.me/${phone.replace(/[^\d+]/g, "")}`;
  return (
    <a href={href} target="_blank" aria-label="WhatsApp" className="fixed bottom-20 right-4 z-[70] group" rel="noreferrer noopener">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={48} height={48} alt="WhatsApp" className="drop-shadow" />
    </a>
  );
}


