import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteBackground from "@/components/SiteBackground";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Calendrier de l’Avent personnalisable",
  description: "Créez un calendrier de l’Avent magique et partagez-le avec vos proches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={displayFont.className}>
      <body className="antialiased font-medium">
        <div className="flex min-h-screen flex-col">
          <SiteBackground>{children}</SiteBackground>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
