"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/POR-removebg-preview.png";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const wordContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeWord, setActiveWord] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const elRef = wordContainerRef.current;
    if (!elRef) return;
    const containerEl = elRef as HTMLDivElement;
    function clear() {
      if (activeWord) activeWord.classList.remove("word-active");
      setActiveWord(null);
    }
    const handleMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
      if (!el) return;
      if (!containerEl.contains(el)) return clear();
      if (el.classList.contains("word-touch")) {
        if (activeWord && activeWord !== el) activeWord.classList.remove("word-active");
        el.classList.add("word-active");
        setActiveWord(el);
      }
    };
    const clearListener: EventListener = () => clear();
    containerEl.addEventListener("touchstart", handleMove as EventListener, { passive: true } as AddEventListenerOptions);
    containerEl.addEventListener("touchmove", handleMove as EventListener, { passive: true } as AddEventListenerOptions);
    containerEl.addEventListener("touchend", clearListener, { passive: true } as AddEventListenerOptions);
    containerEl.addEventListener("touchcancel", clearListener, { passive: true } as AddEventListenerOptions);
    return () => {
      containerEl.removeEventListener("touchstart", handleMove as EventListener);
      containerEl.removeEventListener("touchmove", handleMove as EventListener);
      containerEl.removeEventListener("touchend", clearListener);
      containerEl.removeEventListener("touchcancel", clearListener);
    };
  }, [activeWord]);
  return (
    <main className="relative min-h-screen text-white">
      <section className="relative w-full min-h-screen bg-black">
        {/* Mobile & Tablet: phone hero with transparent subject and giant faded logo behind */}
        <div className="block lg:hidden relative w-full h-[100svh] overflow-hidden bg-black">
          {/* BACK LOGO - massive, faded, behind subject */}
          <div
            className="absolute z-0 left-1/2 pointer-events-none"
            aria-hidden
            style={{ top: "calc(env(safe-area-inset-top) + 1px)", transform: "translateX(-50%)" }}
          >
            <Image
              src={logo}
              alt="Background Logo"
              width={1200}
              height={1200}
              priority
              className="opacity-30 mix-blend-soft-light max-w-none w-[115vw] h-auto"
            />
          </div>
          {/* SUBJECT FOREGROUND (transparent PNG) */}
          <Image src="/trueHERO.png" alt="Hero Subject" fill priority className="object-contain object-top pointer-events-none z-10" />

          {/* Text left, CTA right — vertically centered */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 z-20 select-none">
            <div className="flex items-center justify-between gap-3 pr-2">
              <p className="heading-serif text-white/95 text-xl leading-snug max-w-[62%] select-none [word-spacing:0.02em]">
                <span>Make the </span>
                <em className="italic">best</em>
                <span>{" decision for your "}</span>
                <em className="italic">future</em>
                <span>{" self"}</span>
              </p>
              <Link href="/start" className="pill-button text-sm px-3 py-1.5 whitespace-nowrap shrink-0 interactive">Start your journey</Link>
            </div>
          </div>
        </div>

        {/* Desktop: video hero unchanged */}
        <div className="hidden lg:block">
        {/* Video frame with fixed viewport-relative height to define the seam */}
        <div className="relative w-full -mt-[16px] md:mt-0" style={{ height: "64svh" }}>
          <video
            className="absolute inset-0 w-full h-full hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/mainHERO.mov" type="video/quicktime" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
            {/* Bottom fade to black to soften cutoff */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-36 bg-gradient-to-b from-transparent to-black" />
        </div>

        {/* Overlay centered on the seam; logo center sits exactly on the edge */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl px-6 text-center md:top-[56vh]" style={{ top: "64svh" }}>
          <Image src={logo} alt="Path of Refinement" className="relative mx-auto h-32 md:h-48 w-auto select-none object-contain drop-shadow -translate-y-1/2" priority />
          <p className="heading-serif -mt-10 md:-mt-24 text-white/95 text-2xl md:text-4xl font-light leading-[1.05] text-center">
            Make the <em className="heading-serif italic inline-block align-baseline text-[1.04em] md:text-[1.06em]">best</em> decision
            <br />
            for your <em className="heading-serif italic inline-block align-baseline text-[1.04em] md:text-[1.06em]">future</em> self
          </p>
          <div className="mt-3 md:mt-4">
            <Link href="/start" className="pill-button text-lg md:text-xl px-10 py-4 md:px-12 md:py-5">Start your journey</Link>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}


