"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const leftImages = [
  { src: "/image1.JPG", alt: "Gallery 1" },
  { src: "/image2.JPG", alt: "Gallery 2" },
  { src: "/image3.JPG", alt: "Gallery 3" },
];

const rightImages = [
  { src: "/image4.JPG", alt: "Gallery 4" },
  { src: "/image5.JPG", alt: "Gallery 5" },
  { src: "/image6.JPG", alt: "Gallery 6" },
];

export default function SlidingGallery() {
  const [animate, setAnimate] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only animate on homepage
    if (pathname !== "/") return;
    
    // Reset animation
    setAnimate(false);
    
    // Trigger animation after a brief delay
    const timeout = setTimeout(() => {
      setAnimate(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]); // Re-animate when pathname changes to home

  // Only render on homepage
  if (pathname !== "/") return null;

  return (
    <>
      {/* Left side images - CLICKABLE */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-6">
        {leftImages.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(img.src);
            }}
            className={`relative w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-[1200ms] ease-out cursor-pointer hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] ${
              animate ? "opacity-100 translate-x-4" : "opacity-0 -translate-x-32"
            }`}
            style={{
              transitionDelay: `${i * 200}ms`,
            }}
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover pointer-events-auto"
              sizes="128px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 hover:from-white/25 transition-all pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Right side images - CLICKABLE */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-6">
        {rightImages.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(img.src);
            }}
            className={`relative w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-[1200ms] ease-out cursor-pointer hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] ${
              animate ? "opacity-100 -translate-x-4" : "opacity-0 translate-x-32"
            }`}
            style={{
              transitionDelay: `${i * 200}ms`,
            }}
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover pointer-events-auto"
              sizes="128px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-white/5 via-transparent to-black/20 hover:from-white/25 transition-all pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Expanded image modal - Full screen with dynamic sizing */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-2xl bg-black/85 fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-[85vw] max-h-[85vh] w-auto h-auto">
            <img
              src={expandedImage}
              alt="Expanded gallery image"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.3)]"
              style={{ display: 'block' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full backdrop-blur-xl bg-white/15 border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all shadow-2xl hover:scale-110"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

