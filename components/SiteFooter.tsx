const baseOrder = [5, 12, 1, 18, 9, 23, 3, 14, 7, 20, 2, 16, 24, 10, 6, 21, 4, 15, 8, 19, 11, 22, 13, 17] as const;
const housesOrder = [...baseOrder, ...Array.from({ length: 24 }, (_, i) => i + 1)] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 pt-8 pb-6">
      <div className="w-full overflow-hidden">
        <div className="flex gap-4 animate-marquee-slow py-2">
          {[...housesOrder, ...housesOrder].map((num, idx) => (
            <div key={`${num}-${idx}`} className="flex flex-col items-center min-w-[48px] transition-transform duration-200 ease-in-out hover:scale-110">
              {/* Enveloppe dorée avec ruban rouge */}
              <div className="mb-1 w-12 h-10 relative flex items-center justify-center">
                <svg width="48" height="40" viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
                  {/* Enveloppe dorée */}
                  <defs>
                    <linearGradient id={`gold-${num}-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#e8d5a8', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <rect x="4" y="8" width="40" height="28" rx="2" fill={`url(#gold-${num}-${idx})`} stroke="#b8941f" strokeWidth="0.5"/>
                  {/* Ruban rouge horizontal */}
                  <rect x="4" y="18" width="40" height="4" fill="#dc2626" />
                  {/* Ruban rouge vertical */}
                  <rect x="20" y="8" width="4" height="28" fill="#dc2626" />
                  {/* Noeud au centre */}
                  <circle cx="22" cy="20" r="3" fill="#b91c1c" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-md">{num}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-6 flex items-center justify-center gap-2 text-center text-sm sm:text-base text-white/90">
        <span role="img" aria-label="email">
          ✉️
        </span>
        <a href="mailto:aymeric.desbazeille@hec.edu" className="underline underline-offset-4 hover:text-white transition-colors">
          aymeric.desbazeille@hec.edu
        </a>
      </div>
    </footer>
  );
}
