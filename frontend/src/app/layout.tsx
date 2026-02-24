import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "AÚRELYÑ | Premium Natural Skincare",
  description: "Refresh your skin, love yourself. 100% natural, ethical skincare.",
};

import ClientLayout from "@/components/layout/ClientLayout";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { PageLoader } from "@/components/ui/PageLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} antialiased font-sans`}>
        <SmoothScroll />
        <PageLoader />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
