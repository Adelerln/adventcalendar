const baseOrder = [5, 12, 1, 18, 9, 23, 3, 14, 7, 20, 2, 16, 24, 10, 6, 21, 4, 15, 8, 19, 11, 22, 13, 17] as const;
const housesOrder = [...baseOrder, ...Array.from({ length: 24 }, (_, i) => i + 1)] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 pt-8 pb-6">
      <div className="w-full overflow-hidden">
        <div className="flex gap-4 animate-marquee-slow py-2">
          {[...housesOrder, ...housesOrder].map((num, idx) => (
            <div key={`${num}-${idx}`} className="flex flex-col items-center min-w-[48px] transition-transform duration-200 ease-in-out hover:scale-110">
              {/* Sapin de Noël */}
              <div className="mb-1 w-12 h-14 relative flex items-center justify-center">
                <svg width="48" height="56" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                  {/* Tronc */}
                  <rect x="16" y="38" width="8" height="10" fill="#5c3a1e" rx="1"/>
                  
                  {/* Branches du sapin */}
                  <path d="M20 5 L8 20 L12 20 L5 30 L10 30 L3 40 L37 40 L30 30 L35 30 L28 20 L32 20 Z" fill="#1e4620"/>
                  <path d="M20 8 L10 20 L14 20 L8 28 L13 28 L7 36 L33 36 L27 28 L32 28 L26 20 L30 20 Z" fill="#2d5016"/>
                  
                  {/* Étoile au sommet */}
                  <path d="M20 2 L21 5 L24 5 L22 7 L23 10 L20 8 L17 10 L18 7 L16 5 L19 5 Z" fill="#fbbf24"/>
                  
                  {/* Décorations */}
                  <circle cx="20" cy="15" r="1.5" fill={idx % 2 === 0 ? "#dc2626" : "#fbbf24"}/>
                  <circle cx="15" cy="22" r="1.5" fill={idx % 3 === 0 ? "#fbbf24" : "#dc2626"}/>
                  <circle cx="25" cy="22" r="1.5" fill={idx % 2 === 0 ? "#dc2626" : "#fbbf24"}/>
                  <circle cx="18" cy="28" r="1.5" fill="#fbbf24"/>
                  <circle cx="22" cy="28" r="1.5" fill="#dc2626"/>
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
