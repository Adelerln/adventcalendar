const baseOrder = [5, 12, 1, 18, 9, 23, 3, 14, 7, 20, 2, 16, 24, 10, 6, 21, 4, 15, 8, 19, 11, 22, 13, 17] as const;
const housesOrder = [...baseOrder, ...Array.from({ length: 24 }, (_, i) => i + 1)] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-white/60 backdrop-blur-md text-black pt-8 pb-6">
      <div className="w-full overflow-hidden">
        <div className="flex gap-4 animate-marquee-slow py-2">
          {[...housesOrder, ...housesOrder].map((num, idx) => (
            <div key={`${num}-${idx}`} className="flex flex-col items-center min-w-[48px] transition-transform duration-200 ease-in-out hover:scale-110">
              <img src="/sapin.jpeg" alt="sapin" className="mb-1 h-10 w-auto object-cover" />
              <span className="text-xs font-semibold">{num}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-6 flex items-center gap-2 text-sm sm:text-base">
        <span role="img" aria-label="email">
          ✉️
        </span>
        <a href="mailto:aymeric.desbazeille@hec.edu" className="underline underline-offset-4">
          aymeric.desbazeille@hec.edu
        </a>
      </div>
    </footer>
  );
}
