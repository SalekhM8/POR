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
      <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-full p-2 shadow-lg transition-all group-hover:bg-white/12">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={36} height={36} alt="WhatsApp" className="drop-shadow" />
      </div>
    </a>
  );
}


