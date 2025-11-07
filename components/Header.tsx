import Link from "next/link";
import TokenDialog from "@/components/TokenDialog";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-2xl font-bold text-red-600 dark:text-red-500 hover:scale-105 transition-transform"
        >
          🎄 Advent Calendar
        </Link>
        <nav className="flex items-center gap-6 ml-auto">
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
            className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
          >
            Exemple
          </Link>
          <Link 
            href="/gift/choose-plan" 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Créer mon calendrier
          </Link>
          <TokenDialog triggerClassName="border-2 border-red-600 text-red-600 dark:text-red-400 px-6 py-2 rounded-full font-semibold hover:bg-red-50 dark:hover:bg-red-950 transition-all" />
        </nav>
      </div>
    </header>
  );
}
