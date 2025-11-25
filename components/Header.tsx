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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    router.push("/");
    router.refresh();
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 text-base sm:text-2xl tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:scale-105 transition-transform text-white drop-shadow-lg"
        >
          <span className="relative inline-block w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-full border-4 border-[#6b0f0f] flex-shrink-0 shadow-[0_0_18px_rgba(107,15,15,0.22)] bg-gradient-to-br from-[#fff8e6] to-transparent">
            <Image
              src="/favicon2.png"
              alt="Logo"
              fill
              sizes="(min-width: 640px) 48px, 40px"
              className="object-cover object-center scale-110"
              priority
              quality={100}
              unoptimized
            />
          </span>
          <span className="hidden sm:inline">Advent Calendar</span>
          <span className="sm:hidden">Advent</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 ml-auto text-base font-semibold">
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

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex ml-6 items-center gap-3">
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
                  border: '2px solid #6b0f0f',
                  color: '#6b0f0f',
                }}
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {mobileMenuOpen ? (
            <span className="text-white text-xl">✕</span>
          ) : (
            <span className="text-white text-xl">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
          <nav className="flex flex-col px-4 py-3 space-y-3">
            <Link 
              href="/pricing" 
              className="text-white/90 hover:text-white py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tarifs
            </Link>
            <Link 
              href="/faq" 
              className="text-white/90 hover:text-white py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="/dashboard" 
              className="text-white/90 hover:text-white py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Essaie-le
            </Link>
            
            <div className="pt-3 border-t border-white/20 space-y-3">
              {user ? (
                <>
                  <div className="text-white/90 py-2">{user.name}</div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-center border-2 border-white/30 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-center border-2 border-white/30 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/create-account"
                    className="block text-center px-4 py-2 rounded-full text-white"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                      border: '2px solid #6b0f0f',
                      color: '#6b0f0f',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
