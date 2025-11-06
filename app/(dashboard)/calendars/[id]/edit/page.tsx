type Props = { params: { id: string } };

export default function EditCalendarPage({ params }: Props) {
  const { id } = params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Éditer le calendrier</h1>
      <p className="text-sm text-gray-600">ID: {id}</p>
      <div className="rounded-md border p-4">Éditeur des 24 portes (à implémenter)</div>
    </main>
  );
}


