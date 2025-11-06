export default function MarketingHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold">Calendrier de l’Avent personnalisé</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Créez un calendrier magique pour vos proches. Débloquez une porte par jour en décembre.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/pricing" className="rounded-md bg-black text-white px-5 py-3">Voir les prix</a>
          <a href="/(dashboard)/calendars/new" className="rounded-md border px-5 py-3">Créer un calendrier</a>
        </div>
      </section>
    </main>
  );
}


