type Props = { params: { id: string } };

export default function ShareCalendarPage({ params }: Props) {
  const publicId = params.id || "EXEMPLE_PUBLIC_ID";
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/calendar/${publicId}`;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Partager le lien</h1>
      <p className="text-gray-600">Copiez le lien public pour l’envoyer au destinataire.</p>
      <code className="block rounded-md bg-gray-100 p-3 text-sm overflow-x-auto">{shareUrl}</code>
    </main>
  );
}

