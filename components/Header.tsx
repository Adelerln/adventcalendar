import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md text-black">
      <div className="w-full px-6 py-4 flex items-center justify-between drop-shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl tracking-[0.3em] uppercase hover:scale-105 transition-transform"
        >
          <span className="relative inline-flex w-10 h-10 overflow-hidden rounded-full border border-black/30">
            <Image
              src="/advent_calendar.png"
              alt="Mini sapin"
              fill
              sizes="30px"
              style={{ objectFit: "cover", objectPosition: "65% 25%" }}
              priority
            />
          </span>
          Advent Calendar
        </Link>
        <nav className="flex items-center gap-10 ml-auto text-2xl">
          <Link href="/pricing" className="transition-colors text-black hover:text-[#0f5132]">
            Tarifs
          </Link>
          <Link href="/faq" className="transition-colors text-black hover:text-[#0f5132]">
            FAQ
          </Link>
          <Link href="/dashboard" className="transition-colors text-black hover:text-[#0f5132]">
            Exemple
          </Link>
        </nav>
      </div>
    </header>
  );
}
