type Props = { reason?: string };

export default function Paywall({ reason = "Accès réservé" }: Props) {
  return (
    <div className="rounded-lg border p-6 text-center space-y-3">
      <h3 className="text-xl font-semibold">{reason}</h3>
      <p className="text-gray-600">Souscrivez ou achetez pour continuer.</p>
      <a href="/pricing" className="inline-block rounded-md bg-black text-white px-5 py-3">Voir les offres</a>
    </div>
  );
}


