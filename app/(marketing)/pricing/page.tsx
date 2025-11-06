export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Tarifs</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">Calendrier Solo</h2>
          <p className="text-sm text-gray-600">Achat unique · 1 calendrier</p>
          <p className="text-3xl font-bold mt-4">6,00 €</p>
          <form action="/api/stripe/checkout" method="post" className="mt-6">
            <input type="hidden" name="productId" value="calendar_one_time" />
            <button className="w-full rounded-md bg-black text-white px-5 py-3">Continuer le paiement</button>
          </form>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">Pro Mensuel</h2>
          <p className="text-sm text-gray-600">Abonnement · jusqu’à 5 calendriers</p>
          <p className="text-3xl font-bold mt-4">9,00 €/mois</p>
          <form action="/api/stripe/checkout" method="post" className="mt-6">
            <input type="hidden" name="productId" value="pro_monthly" />
            <button className="w-full rounded-md bg-black text-white px-5 py-3">Démarrer</button>
          </form>
        </div>
      </div>
    </main>
  );
}


