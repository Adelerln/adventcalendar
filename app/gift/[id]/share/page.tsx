import CopyButton from "@/components/gift-builder/CopyButton";
import { getShareToken } from "@/lib/gift-memory-store";

interface Props {
  params: { id: string };
  searchParams: { shareUrl?: string; token?: string };
}

export default function GiftSharePage({ params, searchParams }: Props) {
  const stored = getShareToken(params.id);
  const decoded = searchParams.shareUrl ? decodeURIComponent(searchParams.shareUrl) : undefined;
  const shareUrl = stored?.shareUrl ?? decoded;
  const token = stored?.token ?? searchParams.token;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-red-50 py-16 px-4">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl space-y-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold">Partage</p>
          <h1 className="text-3xl font-bold text-gray-900">Ton calendrier est prêt ✨</h1>
          <p className="text-gray-600">Envoie ce lien au bénéficiaire par SMS, WhatsApp ou email.</p>
        </header>

        {shareUrl ? (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Lien bénéficiaire</label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-gray-800"
              />
              <CopyButton value={shareUrl} />
            </div>
            <p className="text-sm text-gray-500">Tips : envoie ce lien par SMS ou WhatsApp pour un effet surprise garanti.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-orange-400 p-4 text-center text-orange-600">
            Impossible de retrouver le lien. Merci de revenir via le wizard pour générer un nouveau partage.
          </div>
        )}

        {token && (
          <p className="text-xs text-gray-400">Token généré : {token}</p>
        )}
      </div>
    </main>
  );
}
