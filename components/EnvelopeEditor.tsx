"use client";

import { useState } from "react";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  initialContent: DayContent | null;
  allowMusic: boolean;
  plan: PlanKey;
  onSave: (content: DayContent) => void;
  onClose: () => void;
};

export default function EnvelopeEditor({ day, initialContent, allowMusic, plan, onSave, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<DayContent["type"] | null>(initialContent?.type || null);
  const [content, setContent] = useState(initialContent?.content || "");
  const [title, setTitle] = useState(initialContent?.title || "");
  const planTheme = PLAN_APPEARANCE[plan];
  const headerSurface = plan === "plan_premium" ? "bg-[#fbeedc] text-[#5c3b1d]" : "bg-[#f4f6fb] text-[#1f232b]";
  const closeSurface = plan === "plan_premium" ? "bg-[#f3d6b7] text-[#5c3b1d]" : "bg-[#e5e9ef] text-[#4d5663]";
  const selectionHover = plan === "plan_premium" ? "hover:border-[#f5e0c6] hover:bg-[#fff7ee]" : "hover:border-[#d7dde5] hover:bg-[#f5f7fb]";
  const ctaClasses = `${planTheme.ctaBg} ${planTheme.ctaHover} ${planTheme.ctaText}`;
  const selectionButtonClass = `h-full text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all group flex flex-col justify-between ${selectionHover} dark:hover:bg-gray-900/40`;

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
        <div className={`${headerSurface} p-6 rounded-t-2xl border-b border-black/5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Jour {day}</h2>
            <button
              onClick={onClose}
              className={`${closeSurface} w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors`}
            >
              ✕
            </button>
          </div>
          <p className="mt-2 opacity-80">Choisissez le type de contenu</p>
        </div>

        <div className="p-6">
          {!selectedType && (
            <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: "1fr" }}>
              <SelectionButton
                type="photo"
                label="Photo"
                description="Ajouter une image"
                icon="📷"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              <SelectionButton
                type="message"
                label="Message"
                description="Écrire un mot"
                icon="💌"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              <SelectionButton
                type="drawing"
                label="Dessin"
                description="Créer un dessin"
                icon="🎨"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              {allowMusic && (
                <SelectionButton
                  type="music"
                  label="Musique"
                  description="Ajouter un son"
                  icon="🎵"
                  onSelect={setSelectedType}
                  className={selectionButtonClass}
                />
              )}
            </div>
          )}

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

          {selectedType && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={!content}
                className={`flex-1 py-3 rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ctaClasses}`}
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

type SelectionButtonProps = {
  type: DayContent["type"];
  label: string;
  description: string;
  icon: string;
  onSelect: (type: DayContent["type"]) => void;
  className: string;
};

function SelectionButton({ type, label, description, icon, onSelect, className }: SelectionButtonProps) {
  return (
    <button onClick={() => onSelect(type)} className={className}>
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-bold text-lg">{label}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
    </button>
  );
}
