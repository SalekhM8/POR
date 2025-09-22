import VideoBackdrop from "@/components/VideoBackdrop";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VideoBackdrop src="/path.mp4" />
      {children}
    </>
  );
}


