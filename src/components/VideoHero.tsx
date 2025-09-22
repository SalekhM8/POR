import React from "react";

type VideoHeroProps = {
  src: string;
  children?: React.ReactNode;
};

export default function VideoHero({ src, children }: VideoHeroProps) {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/poster.jpg"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        {children}
      </div>
    </section>
  );
}


