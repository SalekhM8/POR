import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["300","400","500","600","700"] });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Wellness Bookings",
  description: "Holistic treatments and recovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased bg-black`}> 
        <Navbar />
        {children}
      </body>
    </html>
  );
}
