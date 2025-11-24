import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteBackground from "@/components/SiteBackground";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calendrier de l'Avent personnalisable",
  description: "Créez un calendrier de l'Avent magique et partagez-le avec vos proches.",
    icons: {
      icon: '/favicon2.png',
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body className="antialiased font-sans">
        <div className="flex min-h-screen flex-col">
          <SiteBackground>{children}</SiteBackground>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
