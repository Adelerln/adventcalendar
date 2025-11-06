export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
      <p className="text-gray-600 dark:text-gray-300">Vos calendriers apparaîtront ici.</p>
      <a href="/(dashboard)/calendars/new" className="inline-block rounded-md border px-4 py-2">Créer un calendrier</a>
    </main>
  );
}


