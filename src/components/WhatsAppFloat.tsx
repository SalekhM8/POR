"use client";
import { usePathname } from "next/navigation";

export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const phone = "+447541499374"; // ensure E.164
  const href = `https://wa.me/${phone.replace(/[^\d+]/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      aria-label="WhatsApp"
      rel="noreferrer noopener"
      className="fixed z-[100] group"
      style={{
        position: "fixed",
        bottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`,
        // place it to the left of the admin shield (approx 60-72px width incl. padding)
        right: `calc(env(safe-area-inset-right, 0px) + 76px)`,
      }}
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={48} height={48} alt="WhatsApp" className="drop-shadow" />
    </a>
  );
}


