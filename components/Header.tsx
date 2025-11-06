import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          🎄 Advent Calendar
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            href="/pricing" 
            className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
          >
            Tarifs
          </Link>
          <Link 
            href="/faq" 
            className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
          >
            FAQ
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-gradient-to-r from-red-600 to-green-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Créer mon calendrier
          </Link>
        </nav>
      </div>
    </header>
  );
}
