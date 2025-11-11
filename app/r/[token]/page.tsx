interface Props {
  params: { token: string };
}

export default function RecipientPlaceholder({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl rounded-3xl bg-white p-8 shadow-xl text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-red-500 font-semibold">Espace bénéficiaire</p>
        <h1 className="text-3xl font-bold text-gray-900">Encore un peu de patience 🎁</h1>
        <p className="text-gray-600">
          Ce placeholder confirme la réception du token <span className="font-mono text-gray-900">{params.token}</span>.
          L&rsquo;expérience finale (authentification + calendrier) sera branchée ici.
        </p>
      </div>
    </main>
  );
}
