"use client";

import { useState } from "react";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  initialContent: DayContent | null;
  allowMusic: boolean;
  onSave: (content: DayContent) => void;
  onClose: () => void;
};

export default function EnvelopeEditor({ day, initialContent, allowMusic, onSave, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<DayContent["type"] | null>(initialContent?.type || null);
  const [content, setContent] = useState(initialContent?.content || "");
  const [title, setTitle] = useState(initialContent?.title || "");

  const handleSave = () => {
    if (!selectedType || !content) return;
    
    onSave({
      type: selectedType,
      content,
      title: title || undefined
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Jour {day}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-white/90 mt-2">Choisissez le type de contenu</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Type selection */}
          {!selectedType && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedType("photo")}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all group"
              >
                <div className="text-5xl mb-3">📷</div>
                <div className="font-bold text-lg">Photo</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ajouter une image</div>
              </button>

              <button
                onClick={() => setSelectedType("message")}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all group"
              >
                <div className="text-5xl mb-3">💌</div>
                <div className="font-bold text-lg">Message</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Écrire un mot</div>
              </button>

              <button
                onClick={() => setSelectedType("drawing")}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all group"
              >
                <div className="text-5xl mb-3">🎨</div>
                <div className="font-bold text-lg">Dessin</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Créer un dessin</div>
              </button>

              {allowMusic && (
                <button
                  onClick={() => setSelectedType("music")}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950 transition-all group"
                >
                  <div className="text-5xl mb-3">🎵</div>
                  <div className="font-bold text-lg">Musique</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ajouter un son</div>
                </button>
              )}
            </div>
          )}

          {/* Photo upload */}
          {selectedType === "photo" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ← Retour
              </button>
              
              <div>
                <label className="block text-sm font-medium mb-2">Télécharger une photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2"
                />
              </div>

              {content && (
                <div className="relative rounded-lg overflow-hidden max-h-64">
                  <img src={content} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Titre (optionnel)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Notre premier Noël ensemble"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          )}

          {/* Message */}
          {selectedType === "message" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ← Retour
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">Votre message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={6}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 resize-none"
                />
              </div>
            </div>
          )}

          {/* Drawing */}
          {selectedType === "drawing" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ← Retour
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">Télécharger un dessin</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2"
                />
              </div>

              {content && (
                <div className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
                  <img src={content} alt="Drawing preview" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}

          {/* Music */}
          {selectedType === "music" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ← Retour
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">Télécharger un fichier audio</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Titre de la chanson</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Notre chanson"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900"
                />
              </div>

              {content && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <audio controls src={content} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          {selectedType && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={!content}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
