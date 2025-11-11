'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type SessionUser = {
  id: string;
  name: string;
  plan: string;
};

export default function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setUser(data.user ?? null);
        }
      })
      .catch(() => {
        if (!ignore) setUser(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    router.refresh();
  };

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
        <nav className="flex items-center gap-6 ml-auto text-base font-semibold">
          <Link href="/pricing" className="transition-colors text-black hover:text-gray-600">
            Tarifs
          </Link>
          <Link href="/faq" className="transition-colors text-black hover:text-gray-600">
            FAQ
          </Link>
          <Link href="/dashboard" className="transition-colors text-black hover:text-gray-600">
            Exemple
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-semibold text-gray-700">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs uppercase tracking-wide border border-[#e5e9ef] px-4 py-2 rounded-full text-[#4d5663] hover:bg-[#e5e9ef] hover:text-[#1f232b] transition-colors"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs uppercase tracking-wide border border-[#e5e9ef] px-4 py-2 rounded-full text-[#4d5663] hover:bg-[#e5e9ef] hover:text-[#1f232b] transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/create-account"
                className="text-xs uppercase tracking-wide border border-[#e5e9ef] px-4 py-2 rounded-full text-[#4d5663] hover:bg-[#e5e9ef] hover:text-[#1f232b] transition-colors"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
