export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <h1 className="text-3xl font-bold">FAQ</h1>
      <section>
        <h2 className="text-xl font-semibold">Qu’est-ce qu’un calendrier de l’Avent personnalisé ?</h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          24 portes, chacune avec un message, une image, un lien ou une vidéo que vous choisissez.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Comment le paiement fonctionne ?</h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Via Stripe. Achat unique pour un calendrier, ou abonnement pour plusieurs.
        </p>
      </section>
    </main>
  );
}


