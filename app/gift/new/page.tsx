import Link from "next/link";
import GiftWizard from "@/components/gift-builder/GiftWizard";

interface Props {
  searchParams?: { access?: string };
}

export default function GiftNewPage({ searchParams }: Props) {
  const hasAccess = !!searchParams?.access;

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-16 px-4">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-2xl text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500 font-semibold">Étape 3</p>
          <h1 className="text-3xl font-bold text-gray-900">Authentifie-toi puis règle l’abonnement avant d’accéder à l’éditeur</h1>
          <p className="text-gray-600">
            Parcours complet : Connexion → Paiement → Création. Reprends l’étape 1 pour valider ton accès puis reviens ici.
          </p>
          <Link
            href="/gift/login"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-red-700"
          >
            Reprendre le parcours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500 font-semibold">Parcours acheteur</p>
          <h1 className="text-4xl font-bold text-gray-900">Créer un calendrier de l&rsquo;Avent personnalisé</h1>
          <p className="text-gray-600">Complète les 3 étapes pour générer ton lien de partage.</p>
        </div>
        <GiftWizard />
      </div>
    </main>
  );
}
