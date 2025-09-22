import React from "react";

export default function VideoBackdrop({ src }: { src: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}


