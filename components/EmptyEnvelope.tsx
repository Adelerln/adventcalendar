"use client";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  content: DayContent | null;
  onClick: () => void;
};

export default function EmptyEnvelope({ day, content, onClick }: Props) {
  const hasContent = content !== null;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group aspect-square"
    >
      {/* Enveloppe */}
      <div className={`relative w-full h-full transition-all duration-300 ${
        hasContent 
          ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border-green-400 dark:border-green-600' 
          : 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-red-300 dark:border-red-700'
      } rounded-lg shadow-lg border-2 group-hover:shadow-xl group-hover:scale-105`}>
        
        {/* Rabat de l'enveloppe */}
        <div className={`absolute inset-x-0 top-0 h-1/2 clip-envelope transition-all ${
          hasContent 
            ? 'bg-gradient-to-br from-green-200 to-green-300 dark:from-green-800 dark:to-green-700 border-b-2 border-green-400 dark:border-green-600' 
            : 'bg-gradient-to-br from-red-200 to-red-300 dark:from-red-800 dark:to-red-700 border-b-2 border-red-400 dark:border-red-600'
        }`}></div>
        
        {/* Numéro du jour */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 transition-all ${
            hasContent 
              ? 'bg-green-500 border-green-700 dark:border-green-400' 
              : 'bg-white dark:bg-gray-800 border-red-400 dark:border-red-600'
          }`}>
            <span className={`text-3xl font-black ${
              hasContent 
                ? 'text-white' 
                : 'text-red-600 dark:text-red-500'
            }`}>
              {day}
            </span>
          </div>
        </div>

        {/* Icône du type de contenu */}
        {hasContent && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
            <span className="text-lg">
              {content.type === "photo" && "📷"}
              {content.type === "message" && "💌"}
              {content.type === "drawing" && "🎨"}
              {content.type === "music" && "🎵"}
            </span>
          </div>
        )}

        {/* Indication */}
        <div className="absolute bottom-3 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            hasContent 
              ? 'text-green-700 dark:text-green-300 bg-white/70 dark:bg-black/70' 
              : 'text-red-700 dark:text-red-300 bg-white/50 dark:bg-black/50'
          }`}>
            {hasContent ? 'Modifier' : 'Ajouter contenu'}
          </span>
        </div>

        {/* Badge "Rempli" */}
        {hasContent && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            ✓
          </div>
        )}
      </div>
    </div>
  );
}
