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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl tracking-[0.3em] uppercase hover:scale-105 transition-transform text-white drop-shadow-lg"
        >
          <span className="relative inline-flex w-14 h-14 overflow-hidden rounded-full border-2 border-[#d4af37]">
            <Image
              src="/enveloppe-logo3.png"
              alt="Enveloppe dorée"
              fill
              sizes="56px"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
              quality={100}
              unoptimized
            />
          </span>
          Advent Calendar
        </Link>
        <nav className="flex items-center gap-6 ml-auto text-base font-semibold">
          <Link href="/pricing" className="transition-colors text-white/90 hover:text-white drop-shadow-md">
            Tarifs
          </Link>
          <Link href="/faq" className="transition-colors text-white/90 hover:text-white drop-shadow-md">
            FAQ
          </Link>
          <Link href="/dashboard" className="transition-colors text-white/90 hover:text-white drop-shadow-md">
            Essaie-le
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-semibold text-white drop-shadow-md">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs uppercase tracking-wide border-2 border-white/30 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs uppercase tracking-wide border-2 border-white/30 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Se connecter
              </Link>
              <Link
                href="/create-account"
                className="text-xs uppercase tracking-wide px-4 py-2 rounded-full text-white hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                  border: '2px solid #4a0808',
                  color: '#4a0808',
                }}
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
